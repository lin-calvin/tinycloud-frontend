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
  content() {
    var filelist = new tc_filelist();
    if (this.url) {
      filelist.url = this.url;
    }
    var fileupload = new tc_fileupload();
    fileupload.url = this.url;
    fileupload.uploadCallback = filelist.uploadCallback;
    filelist.file_upload = fileupload;
    filelist.load_data();
    return html` ${filelist}${fileupload}`;
  }
  // Render the UI as a function of component state
  render() {
    return html`<body>
      <div id="header">
        <p>Tinycloud0.1</p>
        <hr />
      </div>
      <div id="content">${this.content()}</div>
    </body>`;
  }
}

export class tc_filelist extends LitElement {
  static properties = { files: {}, url: {}, menu: {}, file_upload: {} , showHidden:{}};
  static styles = css`
    a {
      color: var(--tc-link-color, blue);
    }
  `;

  load_data = () => {
    this.file_upload.style.display = "none";
    return fetch("/dav" + this.url + "?json_mode=1", {
      method: "PROPFIND",
    }).then((res) => {
      if (res.ok) {
        this.file_upload.style.display = "block";
        res.json().then((res) => {
          var files = res.files.sort((a, b) => {
            return a["name"] > b["name"];
          });
          this.files = files.filter((file) => {
            
              if (file.name.startsWith(".")) {
                return this.showHidden
              }
            
            return true
          });
        });
      } else {
        location.href = "#" + this.url.split("/").slice(0, -2).join("/");
        switch (res.status) {
          case 404:
            alert("文件夹不存在");
            break;
          case 403:
            alert("无权访问");
            break;
        }
      }
    });
  };
  delete_file = (filename) => {
    if (!confirm("删除文件")) {
      return 0;
    }
    fetch("/dav" + this.url + filename + "?json_mode=1", {
      method: "DELETE",
    }).then((res) => {
      if (res.ok) {
        this.load_data();
      }
    });
  };
  mkdir = (dirname) => {
    fetch("/dav" + this.url + dirname + "?json_mode=1", {
      method: "MKCOL",
    }).then((res) => {
      if (res.ok) {
        this.load_data();
      }
    });
  };
  contextmenu = (e) => {
    if (e.target.getAttribute("tc-filename")) {
      e.preventDefault();
      var filename = e.target.getAttribute("tc-filename");
      this.menu.menu = {
        打开: () => {
          window.open("/dav" + this.url + filename);
        },
        下载文件: () => {
          var m = document.createEvent("MouseEvents");
          m.initEvent("click", true, true);
          e.originalTarget.dispatchEvent(m);
        },
        删除: () => {
          this.delete_file(filename);
        },
      };
      this.menu.show(e);
    } else {
      this.menu.menu = {
        新建文件夹: () => {
          name = prompt("文件夹名");
          this.mkdir(name);
        },
        上传文件: () => {
          this.file_upload.input_form.click();
        },
       显示隐藏文件: ()=>{this.showHidden=!this.showHidden},
      };
      this.menu.show(e);
    }
  };
  constructor() {
    super();
    this.showHidden = false;
    this.menu = new tc_contextmenu();
    var files;
    var renderJobs;
    this.url = "/";

    //this.load_data(); //fetch("/dav/"+"/"+"?json_mode=1",{  method: 'PROPFIND'}).then(res=>{res.json().then(res=>this.files=res.files)})
    //    this.renderRoot.addEventListener("contextmenu",this.contextmenu)
  }
  scrollToFile(file) {
    var fileElement = this.shadowRoot.getElementById("file-" + file);
    fileElement.scrollIntoView({ behavior: "smooth" });
    fileElement.style.background = "gray";
    setTimeout(() => {
      fileElement.style.background = "";
    }, 1000);
  }
  uploadCallback = (filename) => {
    this.files.push({
      name: filename,
      path: this.url + filename,
      type: "file",
    });
    this.files.sort((a, b) => {
      return a["name"] > b["name"];
    });
    this.update();
    this.scrollToFile(filename);
  };
  // Render the UI as a function of component stat
  render() {
    this.renderRoot.removeEventListener("contextmenu", this.contextmenu);
    this.renderRoot.addEventListener("contextmenu", this.contextmenu);
    this.onclick = this.menu.close;
    if (!this.files) {
      return;
    }
    for (job in this.renderJobs) {
      job();
    }
    this.renderJobs = [];
    var prev = this.url.split("/").slice(0, -2).join("/");
    return html`
      ${this.menu}
      <strong>Path:${decodeURIComponent(this.url)}</strong></br>
      <div>
      <a class=dir href=#${prev}>../</a></br>
      ${this.files.map(
        (file) =>
          html`${choose(file.type, [
            [
              "dir",
              () =>
                html`<a id=file-${file.name}  tc-filename=${file.name} class=dir href=#${this.url}/${file.name}/>${file.name}/</a>`,
            ],
            [
              "file",
              () =>
                html`<a class=file id=file-${file.name} tc-filename=${file.name} href=/dav/${this.url}/${file.name} download=${file.name}>${file.name}</a>`,
            ],
          ])}</br>`
      )}</div>`;
  }
}

export class tc_fileupload extends LitElement {
  static properties = { url: {}, uploadCallback: {} };
  static styles = css`
    div {
      width: 20rem;
      height: 10rem;
      border-style: solid;
    }
    p {
      margin: 4rem;
    }
  `;
  constructor() {
    super();
    var input_form;
  }
  upload_file(file) {
    fetch("/dav" + this.url + "/" + file.name, {
      method: "PUT",
      body: file,
    }).then(() => this.uploadCallback(file.name));
  }

  render() {
    this.drop = document.createElement("div");
    this.drop.innerHTML = "<p align='center'>Drop file in<p>";
    /*    this.drop.addEventListener(
      "dragenter",
      (e) => {
        e.preventDefault();
      },
      false
    );
    this.drop.addEventListener(
      "dragover",
      (e) => {
        e.preventDefault();
      },
      false
    ); */
    this.drop.addEventListener(
      "drop",
      (e) => {
        e.preventDefault();
        this.upload_file(e.dataTransfer.files[0]);
      },
      false
    );
    this.drop.addEventListener("click", () => this.input_form.click());
    this.input_form = document.createElement("input");
    this.input_form.type = "file";
    this.input_form.style.display = "none";
    this.input_form.onchange = (e) => {
      this.upload_file(this.input_form.files[0]);
    };
    return html`${this.drop}${this.input_form}`;
  }
}

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

customElements.define("tc-main", tinycloud);
customElements.define("tc-filelist", tc_filelist);
customElements.define("tc-fileupload", tc_fileupload);
customElements.define("tc-contextmenu", tc_contextmenu);
