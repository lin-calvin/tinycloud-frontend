import { LitElement, html, css } from "lit";
import { map } from "lit/directives/map.js";
import { choose } from "lit/directives/choose.js";

export class tinycloud extends LitElement {
  static properties = { url: {} };

  constructor() {
    super();
    this.url = location.hash.split("#")[1];
    window.addEventListener(
      "hashchange",
      () => {
        this.hashchange();
      },
      false
    );
  }
  hashchange() {
    this.url = location.hash.split("#")[1];
  }
  // Render the UI as a function of component state
  render() {
    var filelist = new tc_filelist();
    if (this.url) {
      filelist.url = this.url;
    }
    filelist.load_data();
    var fileupload = new tc_fileupload();
    fileupload.url=this.url
    return html`<p align="center">Tinycloud0.1</p>
      <hr />

      ${filelist}${fileupload}`;
  }
}

export class tc_filelist extends LitElement {
  static properties = { files: {}, url: {} };
  load_data() {
    fetch("/dav/" + this.url + "?json_mode=1", { method: "PROPFIND" }).then(
      (res) => {
        res.json().then((res) => (this.files = res.files));
      }
    );
  }
  constructor() {
    super();
    var files;
    this.url = "/";
    console.log(this.url);
    this.load_data(); //fetch("/dav/"+"/"+"?json_mode=1",{  method: 'PROPFIND'}).then(res=>{res.json().then(res=>this.files=res.files)})
  }
  // Render the UI as a function of component stat
  render() {
    if (!this.files) {
      return;
    }
    var prev = this.url.split("/").slice(0, -2).join("/");
    console.log(prev);
    return html`
      <strong>Path:${decodeURIComponent(this.url)}</strong></br>
      <a class=dir href=#${prev}>../</a></br> ${this.files.map(
      (file) =>
        html`${choose(file.type, [
          [
            "dir",
            () =>
              html`<a class=dir href=#${this.url}/${file.name}/>${file.name}/</a>`,
          ],
          [
            "file",
            () =>
              html`<a class=file href=/dav/${this.url}/${file.name} download=${file.name}>${file.name}</a>`,
          ],
        ])}</br>`
    )}`;
  }
}

export class tc_fileupload extends LitElement {
  static properties = { url: {} };
  constructor() {
    super();
    var input_form;
  }
  upload() {
    var file = this.input_form.files[0];
    fetch("/dav" + this.url + "/" + file.name, { method: "PUT", body: file }).then(
      () => alert("ok")
    );
  }

  render() {
    this.input_form = document.createElement("input");
    this.input_form.type = "file";
    this.input_form.onchange = () => this.upload();
    return html`${this.input_form}`
  }
}

customElements.define("tc-main", tinycloud);
customElements.define("tc-filelist", tc_filelist);
customElements.define("tc-fileupload", tc_fileupload);
