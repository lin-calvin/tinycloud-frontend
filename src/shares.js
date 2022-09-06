import { LitElement, html, css } from "lit";
import { msg, updateWhenLocaleChanges } from "@lit/localize";
export class tc_shares extends LitElement {
  static properties = { shares: {} };
  static styles = css`
    a {
      color: var(--tc-link-color, blue);
      text-decoration: none;
    }
  `;
  constructor() {
    super();
    this.token = localStorage["token"];
  }
  loadData() {
    fetch("/api/shares").then((resp) => {
      resp.json().then((res) => {
        this.shares = res;
      });
    });
  }
  removeShare(id) {
    fetch("/api/shares/del", {
      method: "POST",
      header: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: id }),
    }).then((res) => {
      if (res.status == 200) {
        this.loadData();
      }
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
        html`<a href=/shares/${i}>${
          location.origin
        }/shares/${i}</a>&nbspPath: ${path}&nbsp|&nbspUser:${
          this.shares[i].username
        }<button @click=${() => {
          this.removeShare(i);
        }}>del</button></br>`
      );
    }
    return html`${h}`;
  }
}
export class tc_newshare extends LitElement {
  static properties = { path: {} };
  static styles = css`
    #newshare {
      width: 30%;
      height: 15%;
      overflow: auto;
      margin: auto;
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      z-index: 99999;
      background-color: inherit;
    }
  `;
  constructor() {
    super();
  }
  createShare() {
    fetch("/api/shares/new", {
      method: "POST",
      header: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: this.path,
        mode: (this.shadowRoot.getElementById("write").checked && "rw") || "r",
      }),
    }).then(this.remove());
  }
  render() {
    return html`<div id=newshare >${msg("Create share")}&nbsp${
      this.path
    }</br><input id=write type=checkbox>${msg(
      "Write access"
    )}</input></br><div align=center id=button><button @click=${
      this.remove
    }>${msg("Cancel")}</button><button @click=${this.createShare}>${msg(
      "Create"
    )}</button></div></div>`;
  }
}
customElements.define("tc-shares", tc_shares);
customElements.define("tc-newshare", tc_newshare);
