import { LitElement, html, css } from "lit";
export class tc_shares extends LitElement {
  static properties = { shares: {} };
  static styles = css`
    a {
      color: var(--tc-link-color, blue);
      text-decoration: none;
    }
  `;
  constructor(){
  super()
  this.token=localStorage["token"]
}
  loadData() {
    fetch("/api/shares",{headers:{"Authorization":"Bearer "+this.token}}).then((resp) => {
      resp.json().then((res) => {
        this.shares = res;
      });
    });
  }
  render() {
    if (!this.shares) {
      return;
    }
    var h = [];
    for (var i in this.shares) {
      var path = this.shares[i].path;
      if (path == "") {
        path = "/";
      }
      h.push(
        html`<a href=/shares/${i}>${location.origin}/shares/${i}</a>&nbspPath: ${path}&nbsp|&nbspUser:${this.shares[i].username}<button>del</button></br>`
      );
    }
    return html`${h}`;
  }
}
export class tc_newshare extends LitElement {
  // TODO
}
customElements.define("tc-shares", tc_shares);
