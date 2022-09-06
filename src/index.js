import { LitElement, html, css } from "lit";
import { choose } from "lit/directives/choose.js";
import { getLocale, setLocale, decideLocale } from "./locale.js";
import { msg, updateWhenLocaleChanges } from "@lit/localize";
//import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2.2.8/all/lit-all.min.js';
//import { choose } from 'https://cdn.jsdelivr.net/gh/lit/dist@2.2.8/all/lit-all.min.js';

import { cleanPath, getCookie, setCookie } from "./utils.js";
import { tc_settings } from "./settings.js";
import { tc_filelist, tc_fileupload } from "./filelist.js";
import { tc_shares } from "./shares.js";
import { tc_login } from "./login.js";

export class tinycloud extends LitElement {
  static properties = { url: {}, routes: {} };
  static styles = css`
    a {
      color: var(--tc-link-color, blue);
    }
  `;
  constructor() {
    super();
    window.tinycloud = this;
    window.setLocale = setLocale;
    var browserLang = navigator.language;
    updateWhenLocaleChanges(this);
    setLocale(decideLocale(browserLang) || en).then(() => {
      this.localeOk = true;
    });

    if (location.hash.split("#")[1]) {
      this.url = cleanPath(location.hash.split("#")[1]);
    } else {
      this.url = "/";
    }
    window.addEventListener(
      "hashchange",
      () => {
        this.hashchange();
      },
      false
    );
    this.routes = {
      files: [this.contentFiles, () => msg("Files")],
      settings: [this.contentSettings, () => msg("Settings")],
      shares: [this.contentShares, () => msg("Shares")],
      logout: [
        () => {
          delete localStorage["token"];
          location.hash = "files";
          this.update();
        },
        () => msg("Logout"),
      ],
    };
  }
  hashchange() {
    this.url = cleanPath(location.hash.split("#")[1]);
  }
  contentSettings = () => {
    var settings = new tc_settings();
    settings.loadData();
    return html`${settings}`;
  };
  contentShares = () => {
    var shares = new tc_shares();
    shares.loadData();
    return html`${shares}`;
  };
  contentFiles = () => {
    var url = "/" + this.url.split("/").slice(2).join("/");
    var urlRoot = this.url.split("/").slice(0, 2).join("/");

    var filelist = new tc_filelist();
    filelist.url = url;
    filelist.urlRoot = urlRoot;
    var fileupload = new tc_fileupload();
    fileupload.url = url;
    fileupload.uploadFinishedCallback = filelist.uploadFinishedCallback;
    fileupload.uploadProgressCallback = filelist.uploadProgressCallback;
    filelist.file_upload = fileupload;
    filelist.loadData();
    return html` ${filelist}${fileupload}`;
  };
  // Render the UI as a function of component state
  render() {
    //console.log(this.url.split('/')[])
    if (!this.localeOk) {
      return;
    }
    if (this.needLogin == undefined) {
      if (localStorage["token"]) {
        fetch("/api/auth/check", {
          method: "POST",
          header: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: localStorage["token"] }),
        }).then((res) => {
          res.json().then(() => {
            this.needLogin = res.status != 200;
            this.update();
          });
        });
      } else {
        this.needLogin = true;
      }
      return;
    }
    if (this.needLogin) {
      var login = true;
      var contFunc = () => {
        return new tc_login();
      };
    }
    var menu = [];
    if (!login) {
      setCookie("token", localStorage["token"]);
      if (this.url == "/") {
        location.hash = "/files";
      }
      for (var i in this.routes) {
        menu.push([this.routes[i][1], this.routes[i][0], i]);
      }
      var contFunc = this.routes[this.url.split("/")[1]][0];
    }
    return html`<body>
      <div id="header">
        Tinycloud0.1
        <div align="right">
          ${menu.map((x) => html`<a href="#${x[2]}">${x[0]()}</a>&nbsp`)}
        </div>
        <hr />
      </div>
      <div id="content">${contFunc()}</div>
    </body>`;
  }
}

customElements.define("tc-main", tinycloud);
