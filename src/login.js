import { LitElement, html, css } from "lit";
import { msg, updateWhenLocaleChanges } from "@lit/localize";
import { setCookie } from "./utils.js";
export class tc_login extends LitElement {
  static properties = {};
  constructor() {
    super();
    updateWhenLocaleChanges(this);
  }
  login() {
    setCookie("token", "", 0);
    var username = this.shadowRoot.getElementById("username").value;
    var passwd = this.shadowRoot.getElementById("passwd").value;
    fetch("/api/auth/login", {
      method: "POST",
      headers: { Authorization: "Basic " + btoa(username + ":" + passwd) },
    }).then((res) => {
      res.json().then((res) => {
        if (res.status == 200) {
          localStorage.token = res.token;
          window.tinycloud.needLogin = false;
          window.tinycloud.update();
        }
      });
    });
  }
  render() {
    return html`<center><label for="username">${msg(
      "Username"
    )}:</label><input tyep="text" id="username" /></br><label for="passwd">${msg(
      "Password"
    )}:</label><input type="password" id="passwd" /></br><button @click=${
      this.login
    }>${msg("Login")}</button></center>`;
  }
}
customElements.define("tc-login", tc_login);
