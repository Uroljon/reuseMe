class CustomModal extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const seen = sessionStorage.getItem('reuse_modal_shown');
    if (seen === '1') return;

    this._rootModal = this.querySelector('#welcome-modal') || this.querySelector('.modal');
    if (!this._rootModal) return;

    this._allowBtn = this.querySelector('#allow-location');
    this._closeBtn = this.querySelector('#dont-allow');
    this._iconClose = this.querySelector('#modal-close');

    this._allowBtn && this._allowBtn.addEventListener('click', this._onAllow.bind(this));
    this._closeBtn && this._closeBtn.addEventListener('click', this._onClose.bind(this));
    this._iconClose && this._iconClose.addEventListener('click', this._onClose.bind(this));
    window.addEventListener('keydown', this._onKey.bind(this));

    this._rootModal.style.display = 'flex';
    document.body.classList.add('modal-active');
    // setTimeout(() => this._allowBtn && this._allowBtn.focus(), 150);
  }

  _onKey(e) {
    if (e.key === 'Escape') this._onClose();
  }

  _onClose() {
    sessionStorage.setItem('reuse_modal_shown', '1');
    this._hide();
  }

  _onAllow() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      this._onClose();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };

        // If global map is available, update it
        if (window.map && typeof window.map.setView === 'function') {
          try {
            window.map.setView([coords.lat, coords.lon], 13);
            if (window.L) {
              L.circleMarker([coords.lat, coords.lon], { radius: 6, color: '#0b7a3a' }).addTo(window.map).bindPopup('Your location');
            }
          } catch (e) {
            console.warn('Could not update global map with location', e);
          }
        }

        this.dispatchEvent(new CustomEvent('reuse-user-location', { detail: coords, bubbles: true }));
        sessionStorage.setItem('reuse_modal_shown', '1');
        this._hide();
      },
      (err) => {
        console.warn('Geolocation failed or denied', err);
        this.dispatchEvent(new CustomEvent('reuse-user-location-error', { detail: err, bubbles: true }));
        sessionStorage.setItem('reuse_modal_shown', '1');
        this._hide();
      },
      { timeout: 10000 }
    );
  }

  _hide() {
    if (this._rootModal) this._rootModal.style.display = 'none';
  }
}

customElements.define('custom-modal', CustomModal);