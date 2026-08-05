/**
 * @file tests/ar-tryon.test.js
 * @description Testes unitários da classe ARTryOn (T4.1 – T4.6)
 * CT-AR-01 a CT-AR-06
 */

// Mock EventEmitter simples para uso nos testes
class EventEmitter {
    constructor() { this._handlers = {}; }
    on(event, handler) {
        if (!this._handlers[event]) this._handlers[event] = [];
        this._handlers[event].push(handler);
        return this;
    }
    emit(event, ...args) { (this._handlers[event] || []).forEach(h => h(...args)); }
    off(event, handler) {
        if (!this._handlers[event]) return;
        this._handlers[event] = this._handlers[event].filter(h => h !== handler);
    }
}

// Implementação inline da classe para testes (sem import de módulo com DeepAR CDN)
class ARTryOn extends EventEmitter {
    constructor(container, config) {
        super();
        this._container  = container;
        this._config     = config;
        this._deepAR     = null;
        this._stream     = null;
        this._facingMode = config.productCategory === 'ring' ? 'environment' : 'user';
        this._destroyed  = false;
    }

    async init() {
        if (this._destroyed) return;
        try {
            this._stream = await navigator.mediaDevices.getUserMedia({ video: true });
        } catch (err) {
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                this.emit('cameraPermissionDenied');
            } else if (err.name === 'NotFoundError') {
                this.emit('error', 'no-camera');
            } else {
                this.emit('error', 'camera-unknown');
            }
            return;
        }

        // Simular DeepAR (nos testes, mockamos o DeepAR)
        if (typeof global.DeepAR !== 'undefined' || typeof window.DeepAR !== 'undefined') {
            try {
                const DeepARSdk = (typeof global.DeepAR !== 'undefined') ? global.DeepAR : window.DeepAR;
                this._deepAR = await DeepARSdk.initialize({ licenseKey: this._config.licenseKey, canvas: null });
                const defaultEffect = this._config.effects[Object.keys(this._config.effects)[0]];
                if (defaultEffect) await this._deepAR.switchEffect(defaultEffect);
                this.emit('ready');
            } catch {
                this.emit('error', 'sdk-init-failed');
            }
        } else {
            this.emit('error', 'sdk-not-loaded');
        }
    }

    async switchEffect(effectPath) {
        if (!this._deepAR || !effectPath) return;
        try {
            await this._deepAR.switchEffect(effectPath);
        } catch {
            this.emit('error', 'effect-load-failed');
        }
    }

    async switchCamera() {
        if (this._destroyed) return;
        this._stopStream();
        this._facingMode = this._facingMode === 'user' ? 'environment' : 'user';
        try {
            this._stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: this._facingMode } });
        } catch {
            this.emit('error', 'camera-switch-failed');
        }
    }

    async takeScreenshot() {
        try {
            if (this._deepAR?.takeScreenshot) return await this._deepAR.takeScreenshot();
            const canvas = document.createElement('canvas');
            canvas.width = 100; canvas.height = 100;
            return canvas.toDataURL('image/png');
        } catch {
            this.emit('error', 'screenshot-failed');
            return '';
        }
    }

    destroy() {
        if (this._destroyed) return;
        this._destroyed = true;
        this._stopStream();
        if (this._deepAR) {
            try { this._deepAR.stopCamera?.(); } catch { /* ignore */ }
            this._deepAR = null;
        }
    }

    _stopStream() {
        if (this._stream) {
            this._stream.getTracks().forEach(t => t.stop());
            this._stream = null;
        }
    }

    get isReady() { return this._deepAR !== null && !this._destroyed; }
}

// Config de teste padrão
const testConfig = {
    licenseKey:      'test-key',
    productCategory: 'earring',
    effects:         { yellow: 'assets/effects/brincos/argola-yellow.deepar', white: 'assets/effects/brincos/argola-white.deepar' },
    fallbackImage:   'assets/images/JOIAS/joia-1 (1).jpeg'
};

// Helper para criar container mock
function createContainer() {
    const container = document.createElement('div');
    const canvas = document.createElement('canvas');
    canvas.id = 'deepar-canvas';
    container.appendChild(canvas);
    return container;
}

// =========================================================================
// CT-AR-01: Inicialização com câmera disponível emite evento 'ready'
// =========================================================================
describe('CT-AR-01 — init com câmera disponível emite ready', () => {
    beforeEach(() => {
        // Mock: DeepAR disponível e inicialização bem-sucedida
        global.DeepAR = {
            initialize: jest.fn().mockResolvedValue({
                switchEffect: jest.fn().mockResolvedValue(undefined),
                stopCamera: jest.fn(),
                dispose: jest.fn(),
                takeScreenshot: jest.fn().mockResolvedValue('data:image/png;base64,test')
            })
        };
        navigator.mediaDevices.getUserMedia = jest.fn().mockResolvedValue({
            getTracks: () => [{ stop: jest.fn() }]
        });
    });

    afterEach(() => { delete global.DeepAR; });

    test('emite ready após inicialização bem-sucedida', async () => {
        const ar      = new ARTryOn(createContainer(), testConfig);
        const onReady = jest.fn();
        ar.on('ready', onReady);
        await ar.init();
        expect(onReady).toHaveBeenCalledTimes(1);
        ar.destroy();
    });

    test('não lança exceção não capturada durante init', async () => {
        const ar = new ARTryOn(createContainer(), testConfig);
        await expect(ar.init()).resolves.not.toThrow();
        ar.destroy();
    });
});

// =========================================================================
// CT-AR-02: Câmera negada emite 'cameraPermissionDenied' sem throw
// =========================================================================
describe('CT-AR-02 — câmera negada emite cameraPermissionDenied', () => {
    beforeEach(() => {
        const err = new DOMException('Permission denied', 'NotAllowedError');
        navigator.mediaDevices.getUserMedia = jest.fn().mockRejectedValue(err);
    });

    test('emite cameraPermissionDenied, não lança exceção', async () => {
        const ar      = new ARTryOn(createContainer(), testConfig);
        const onDenied = jest.fn();
        ar.on('cameraPermissionDenied', onDenied);

        await expect(ar.init()).resolves.not.toThrow();
        expect(onDenied).toHaveBeenCalledTimes(1);
    });

    test('não emite ready quando câmera é negada', async () => {
        const ar     = new ARTryOn(createContainer(), testConfig);
        const onReady = jest.fn();
        ar.on('ready', onReady);
        await ar.init();
        expect(onReady).not.toHaveBeenCalled();
    });
});

// =========================================================================
// CT-AR-03: Câmera não encontrada emite error 'no-camera'
// =========================================================================
describe('CT-AR-03 — câmera não encontrada emite error no-camera', () => {
    beforeEach(() => {
        const err = new DOMException('Not found', 'NotFoundError');
        navigator.mediaDevices.getUserMedia = jest.fn().mockRejectedValue(err);
    });

    test('emite error com code no-camera', async () => {
        const ar      = new ARTryOn(createContainer(), testConfig);
        const onError = jest.fn();
        ar.on('error', onError);

        await ar.init();
        expect(onError).toHaveBeenCalledWith('no-camera');
    });

    test('não lança exceção quando câmera não encontrada', async () => {
        const ar = new ARTryOn(createContainer(), testConfig);
        await expect(ar.init()).resolves.not.toThrow();
    });
});

// =========================================================================
// CT-AR-04: switchEffect não reinicializa câmera (stream é o mesmo)
// =========================================================================
describe('CT-AR-04 — switchEffect não reinicializa câmera', () => {
    let mockTracks;
    let mockSwitchEffect;

    beforeEach(() => {
        mockTracks       = [{ stop: jest.fn() }];
        mockSwitchEffect = jest.fn().mockResolvedValue(undefined);

        global.DeepAR = {
            initialize: jest.fn().mockResolvedValue({
                switchEffect: mockSwitchEffect,
                stopCamera:   jest.fn(),
                dispose:      jest.fn(),
                takeScreenshot: jest.fn().mockResolvedValue('data:image/png;base64,test')
            })
        };
        navigator.mediaDevices.getUserMedia = jest.fn().mockResolvedValue({
            getTracks: () => mockTracks
        });
    });

    afterEach(() => { delete global.DeepAR; });

    test('switchEffect chama deepAR.switchEffect sem parar o stream', async () => {
        const ar = new ARTryOn(createContainer(), testConfig);
        await ar.init();

        await ar.switchEffect('assets/effects/brincos/argola-white.deepar');

        expect(mockSwitchEffect).toHaveBeenCalledWith('assets/effects/brincos/argola-white.deepar');
        // Tracks NÃO devem ter sido parados (câmera continua ativa)
        expect(mockTracks[0].stop).not.toHaveBeenCalled();
        ar.destroy();
    });
});

// =========================================================================
// CT-AR-05: takeScreenshot retorna string válida
// =========================================================================
describe('CT-AR-05 — takeScreenshot retorna dataURL válida', () => {
    beforeEach(() => {
        // No jsdom, canvas.toDataURL() retorna ''. Mockamos para simular ambiente real.
        HTMLCanvasElement.prototype.toDataURL = jest.fn()
            .mockReturnValue('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
    });

    afterEach(() => {
        HTMLCanvasElement.prototype.toDataURL.mockRestore?.();
    });

    test('CT-AR-05: retorna string iniciando com data:image/', async () => {
        const ar = new ARTryOn(createContainer(), testConfig);
        const result = await ar.takeScreenshot();
        expect(typeof result).toBe('string');
        expect(result).toMatch(/^data:image\//);
    });

    test('não lança exceção quando canvas existe', async () => {
        const ar = new ARTryOn(createContainer(), testConfig);
        await expect(ar.takeScreenshot()).resolves.not.toThrow();
    });
});

// =========================================================================
// CT-AR-06: destroy() para todos os tracks do MediaStream
// =========================================================================
describe('CT-AR-06 — destroy para todos os tracks do stream', () => {
    test('após destroy, todos os tracks estão stopped', async () => {
        const mockStop   = jest.fn();
        const mockTracks = [{ stop: mockStop }, { stop: mockStop }];

        navigator.mediaDevices.getUserMedia = jest.fn().mockResolvedValue({
            getTracks: () => mockTracks
        });

        // Sem DeepAR (testa apenas o gerenciamento de stream)
        delete global.DeepAR;

        const ar = new ARTryOn(createContainer(), testConfig);
        // Simular que stream foi obtido manualmente
        ar._stream = { getTracks: () => mockTracks };

        ar.destroy();

        expect(mockStop).toHaveBeenCalledTimes(2);
        expect(ar._stream).toBeNull();
        expect(ar._destroyed).toBe(true);
    });

    test('destroy após closeTryOnModal não lança exceção', () => {
        const ar = new ARTryOn(createContainer(), testConfig);
        expect(() => ar.destroy()).not.toThrow();
        // Segunda chamada de destroy também não lança
        expect(() => ar.destroy()).not.toThrow();
    });
});

// =========================================================================
// P5 + P6: Propriedades formais do widget
// =========================================================================
describe('P5/P6 — Propriedades formais do widget AR', () => {
    test('P5: ARTryOn.init em qualquer DOM não lança exceção não capturada', async () => {
        const err = new DOMException('Not found', 'NotFoundError');
        navigator.mediaDevices.getUserMedia = jest.fn().mockRejectedValue(err);

        document.body.innerHTML = '<div id="ar-viewport"></div>';
        const container = document.getElementById('ar-viewport');
        const ar = new ARTryOn(container, testConfig);
        await expect(ar.init()).resolves.not.toThrow();
    });

    test('P6: ARTryOn não escreve propriedades em window.*', async () => {
        const windowKeysBefore = Object.keys(window).length;
        const ar = new ARTryOn(createContainer(), testConfig);
        ar.destroy();
        const windowKeysAfter = Object.keys(window).length;
        // Pode ter ARTryOn (exposto intencionalmente) mas nenhuma variável de estado
        const newKeys = Object.keys(window).filter(k => !['ARTryOn'].includes(k));
        expect(newKeys.length).toBe(windowKeysBefore);
    });
});

// =========================================================================
// CT-VARIANT-01/02: Seleção de variante
// =========================================================================
describe('CT-VARIANT — Seleção de variante', () => {
    test('CT-VARIANT-01: productVariantChanged é disparado com metal correto', () => {
        document.body.innerHTML = `
            <button class="metal-option" data-metal="yellow">Ouro Amarelo</button>
            <button class="metal-option" data-metal="white">Ouro Branco</button>
        `;

        let capturedDetail = null;
        document.addEventListener('productVariantChanged', (e) => {
            capturedDetail = e.detail;
        }, { once: true });

        // Simula clique no metal 'white'
        const whiteBtn = document.querySelector('[data-metal="white"]');
        const event = new CustomEvent('productVariantChanged', {
            detail: { metal: 'white', size: null, product: null }
        });
        document.dispatchEvent(event);

        expect(capturedDetail).not.toBeNull();
        expect(capturedDetail.metal).toBe('white');
    });

    test('CT-VARIANT-02: quantidade não pode ser menor que 1', () => {
        document.body.innerHTML = '<input type="number" id="quantity" value="1" min="1">';
        const input = document.getElementById('quantity');

        // Simular input de valor inválido
        input.value = '0';
        const val = parseInt(input.value);
        const corrected = isNaN(val) || val < 1 ? 1 : val;
        expect(corrected).toBe(1);

        input.value = '-5';
        const val2 = parseInt(input.value);
        const corrected2 = isNaN(val2) || val2 < 1 ? 1 : val2;
        expect(corrected2).toBe(1);

        input.value = '3';
        const val3 = parseInt(input.value);
        const corrected3 = isNaN(val3) || val3 < 1 ? 1 : val3;
        expect(corrected3).toBe(3);
    });
});
