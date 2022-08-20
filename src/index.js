import { LitElement, html, css } from "lit";
import { choose } from "lit/directives/choose.js";

//import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2.2.8/all/lit-all.min.js';
//import { choose } from 'https://cdn.jsdelivr.net/gh/lit/dist@2.2.8/all/lit-all.min.js';

import { cleanPath } from "./utils.js";
import { tc_settings } from "./settings.js";
import { tc_filelist,tc_fileupload } from "./filelist.js";
export class tinycloud extends LitElement {
  static properties = { url: {}, routes: {} };
  static styles = css`
    a {
      color: var(--tc-link-color, blue);
    }
  `;
  constructor() {
    super();
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
      files: [this.contentFiles, "Files"],
      settings: [this.contentSettings, "Settings"],
    };
  }
  hashchange() {
    this.url = cleanPath(location.hash.split("#")[1]);
  }
  contentSettings = () => {
    var settings = new tc_settings();
    settings.load_data();
    return html`${settings}`;
  };
  contentFiles = () => {
    var url = "/" + this.url.split("/").slice(2).join("/");
    var urlRoot = this.url.split("/").slice(0, 2).join("/");
    console.log(urlRoot);
    var filelist = new tc_filelist();
    filelist.url = url;
    filelist.urlRoot = urlRoot;
    var fileupload = new tc_fileupload();
    fileupload.url = url;
    fileupload.uploadFinishedCallback = filelist.uploadFinishedCallback;
    fileupload.uploadProgressCallback = filelist.uploadProgressCallback;
    filelist.fi le_upload = fileupload;
    filelist.load_data();
    return html` ${filelist}${fileupload}`;
  };
  // Render the UI as a function of component state
  render() {
    //console.log(this.url.split('/')[])
    var menu = [];
    for (var i in this.routes) {
      menu.push([this.routes[i][1], this.routes[i][0], i]);
    }
    if (this.url == "/") {
      location.hash = "/files";
    }
    var contFunc = this.routes[this.url.split("/")[1]][0];
    return html`<body>
      <div id="header">
        Tinycloud0.1
        <div align="right">
          ${menu.map((x) => html`<a href="#${x[2]}">${x[0]}</a>&nbsp`)}
        </div>
        <hr />
      </div>
      <div id="content">${contFunc()}</div>
    </body>`;
  }
}

customElements.define("tc-main", tinycloud);
