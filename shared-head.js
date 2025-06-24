class SharedHead extends HTMLElement {
  async connectedCallback() {
    const res = await fetch('shared-head.html');
    if (!res.ok) return console.error('could not load shared head');

    const text = await res.text();
    const container = document.createElement('template');
    container.innerHTML = text;

    // Append the fragment itself
    document.head.append(container.content.cloneNode(true));
  }
}
customElements.define('shared-head', SharedHead);
