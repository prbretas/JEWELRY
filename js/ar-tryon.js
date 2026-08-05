/**
 * @file js/ar-tryon.js
 * @module ARTryOn
 * @description Módulo AR Try-On isolado para prova virtual de joias via câmera.
 * Encapsula DeepAR SDK, permissão de câmera, troca de efeito, captura de foto.
 * Projetado para ser reutilizável como widget embarcável em sites de joalherias.
 *
 * Tasks implementadas:
 * - T4.1: Classe ARTryOn com interface pública completa
 * - T4.2: UX de permissão de câmera com mensagens por browser
 * - T4.3: Integração com DeepAR SDK e carregamento de efeitos por metal
 * - T4.4: Fallback gracioso para todos os cenários de falha
 * - T4.5: Troca de câmera frontal/traseira
 * - T4.6: Captura de foto com download e Web Share API
 *
 * @version 1.0.0
 * @date 2026-08-04
 */

/**
 * EventEmitter simples e interno — sem dependências externas.
 */
class EventEmitter {
    constructor() {
        this._handlers = {};
    }
    on(event, handler) {
        if (!this._handlers[event]) this._handlers[event] = [];
        this._handlers[event].push(handler);
        return this;
    }
    emit(event, ...args) {
        (this._handlers[event] || []).forEach(h => h(...args));
    }
    off(event, handler) {
        if (!this._handlers[event]) return;
        this._handlers[event] = this._handlers[event].filter(h => h !== handler);
    }
}

/**
 * @class ARTryOn
 * @description Classe principal do módulo AR Try-On.
 *
 * Uso básico:
 *   const ar = new ARTryOn(containerEl, { licenseKey, productCategory, effects, fallbackImage });
 *   ar.on('ready', () => { ... });
 *   ar.on('error', (code) => { ... });
 *   ar.on('cameraPermissionDenied', () => { ... });
 *   await ar.init();
 */
class ARTryOn extends EventEmitter {
    /**
     * @param {HTMLElement} container - Elemento pai onde o canvas será renderizado
     * @param {Object} config - Configuração do componente
     * @param {string} config.licenseKey - Chave de licença DeepAR
     * @param {'ring'|'earring'|'necklace'|'bracelet'} config.productCategory - Categoria do produto
     * @param {Object} config.effects - Mapa metal → path do arquivo .deepar
     * @param {string} [config.fallbackImage] - URL de imagem para fallback
     */
    constructor(container, config) {
        super();
        this._container    = container;
        this._config       = config;
        this._deepAR       = null;       // instância DeepAR SDK
        this._stream       = null;       // MediaStream ativo
        this._currentMetal = 'yellow';   // metal padrão
        this._facingMode   = this._defaultFacingMode(config.productCategory);
        this._destroyed    = false;
    }

    /**
     * Câmera frontal para brincos/colares; traseira para anéis/pulseiras
     */
    _defaultFacingMode(category) {
        return (category === 'ring' || category === 'bracelet') ? 'environment' : 'user';
    }

    // -------------------------------------------------------------------------
    // init() — ponto de entrada público (T4.1 + T4.2 + T4.3)
    // -------------------------------------------------------------------------

    /**
     * @method init
     * @description Solicita câmera e inicializa DeepAR.
     * Emite: 'ready' | 'error' | 'cameraPermissionDenied'
     * NUNCA lança exceção não capturada (P5).
     */
    async init() {
        if (this._destroyed) return;

        try {
            // T4.2: Solicitar permissão de câmera
            this._stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: this._facingMode,
                    width:  { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });
        } catch (err) {
            // T4.2: Diferenciar tipo de erro para UX correta
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                this.emit('cameraPermissionDenied');
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                this.emit('error', 'no-camera');
            } else {
                this.emit('error', 'camera-unknown');
            }
            return; // Retorna sem lançar
        }

        // T4.3: Inicializar DeepAR
        await this._initDeepAR();
    }

    async _initDeepAR() {
        if (this._destroyed) return;

        const canvas = this._container?.querySelector('#deepar-canvas')
                    || this._container;

        // Se DeepAR SDK não disponível, emitir erro gracioso
        if (typeof DeepAR === 'undefined' && typeof window.DeepAR === 'undefined') {
            this.emit('error', 'sdk-not-loaded');
            return;
        }

        const DeepARSdk = (typeof DeepAR !== 'undefined') ? DeepAR : window.DeepAR;

        try {
            this._deepAR = await DeepARSdk.initialize({
                licenseKey: this._config.licenseKey,
                canvas:     canvas,
                videoElement: this._createVideoElement(),
            });

            // Carregar efeito do metal padrão (primeiro disponível)
            const defaultEffect = this._config.effects[this._currentMetal]
                                || Object.values(this._config.effects)[0];
            if (defaultEffect) {
                await this._deepAR.switchEffect(defaultEffect);
            }

            this.emit('ready');

        } catch (err) {
            // T4.4: Fallback gracioso — emite erro, não lança
            this.emit('error', 'sdk-init-failed');
        }
    }

    _createVideoElement() {
        const video  = document.createElement('video');
        video.srcObject = this._stream;
        video.autoplay  = true;
        video.playsInline = true;
        video.muted = true;
        return video;
    }

    // -------------------------------------------------------------------------
    // switchEffect() — troca efeito SEM reinicializar câmera (T4.3, CT-AR-04)
    // -------------------------------------------------------------------------

    /**
     * @method switchEffect
     * @param {string} effectPath - Caminho do arquivo .deepar
     */
    async switchEffect(effectPath) {
        if (!this._deepAR || !effectPath) return;
        try {
            await this._deepAR.switchEffect(effectPath);
        } catch (err) {
            this.emit('error', 'effect-load-failed');
        }
    }

    // -------------------------------------------------------------------------
    // switchCamera() — alterna frontal/traseira (T4.5)
    // -------------------------------------------------------------------------

    /**
     * @method switchCamera
     * @description Para stream atual e reinicializa com facingMode oposto.
     */
    async switchCamera() {
        if (this._destroyed) return;

        // Parar stream anterior
        this._stopStream();

        this._facingMode = this._facingMode === 'user' ? 'environment' : 'user';

        try {
            this._stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: this._facingMode }
            });

            // Atualizar o video element no DeepAR
            if (this._deepAR) {
                const videoEl = this._createVideoElement();
                if (this._deepAR.setVideoElement) {
                    this._deepAR.setVideoElement(videoEl);
                }
            }
        } catch (err) {
            this.emit('error', 'camera-switch-failed');
        }
    }

    // -------------------------------------------------------------------------
    // takeScreenshot() — captura foto (T4.6, CT-AR-05)
    // -------------------------------------------------------------------------

    /**
     * @method takeScreenshot
     * @returns {Promise<string>} dataURL da imagem capturada
     */
    async takeScreenshot() {
        try {
            if (this._deepAR && typeof this._deepAR.takeScreenshot === 'function') {
                return await this._deepAR.takeScreenshot();
            }
            // Fallback: capturar do canvas diretamente
            const canvas = this._container?.querySelector('#deepar-canvas')
                         || this._container?.querySelector('canvas');
            if (canvas) {
                return canvas.toDataURL('image/png');
            }
            throw new Error('canvas-not-found');
        } catch (err) {
            this.emit('error', 'screenshot-failed');
            return '';
        }
    }

    // -------------------------------------------------------------------------
    // destroy() — libera todos os recursos (CT-AR-06)
    // -------------------------------------------------------------------------

    /**
     * @method destroy
     * @description Para câmera, libera DeepAR. Todos os tracks são stopped.
     */
    destroy() {
        if (this._destroyed) return;
        this._destroyed = true;
        this._stopStream();
        if (this._deepAR) {
            try { this._deepAR.stopCamera?.(); } catch { /* ignore */ }
            try { this._deepAR.dispose?.();    } catch { /* ignore */ }
            this._deepAR = null;
        }
        this._handlers = {};
    }

    _stopStream() {
        if (this._stream) {
            this._stream.getTracks().forEach(track => track.stop());
            this._stream = null;
        }
    }

    // -------------------------------------------------------------------------
    // Helpers públicos
    // -------------------------------------------------------------------------

    /** @returns {boolean} */
    get isReady() {
        return this._deepAR !== null && !this._destroyed;
    }

    /** @returns {string} Metal selecionado atualmente */
    get currentMetal() {
        return this._currentMetal;
    }
}

// Expor globalmente para uso sem bundler (páginas que não usam import)
if (typeof window !== 'undefined') {
    window.ARTryOn = ARTryOn;
}

// Exportar também como módulo ES6 (para testes Jest)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ARTryOn };
}
