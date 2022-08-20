import { LitElement, html, css } from "lit";
export class tc_contextmenu extends LitElement {
  static properties = { menu: {} };
  static styles = css`
    div {
      width: 200px;
      border: 1px solid #999;
      background-color: var(--tc-ctxmenu-color, gray);
      position: absolute;
      top: 10px;
      left: 10px;
      display: none;
      z-index: 9999999;
    }
    ul {
      list-style: none;
    }
    a:hover {
      background: var(--tc-link-color, #fff);
    }
  `;

  show = (ev) => {
    ev.preventDefault();
    var e = ev || window.event;

    var context = this.shadowRoot.getElementById("context");
    context.style.display = "block";

    var x = e.pageX;
    var y = e.pageY;

    context.style.left = x + "px";
    context.style.top = y + "px";

    return false;
  };
  close = () => {
    this.shadowRoot.getElementById("context").style.display = "none";
  };
  constructor() {
    super();
    var menu;
  }
  render() {
    var res = [];
    var item;
    for (item in this.menu) {
      res.push(html`<li><a @click=${this.menu[item]}>${item}</a></li>`);
    }
    return html`<div id="context">
      <ul>
        ${res}
      </ul>
    </div>`;
  }
}
customElements.define("tc-contextmenu", tc_contextmenu);
