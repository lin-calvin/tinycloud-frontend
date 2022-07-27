import { LitElement, html, css } from "lit";
import { choose } from "lit/directives/choose.js";

//import { LitElement, html, css } from "https://cdn.jsdelivr.net/gh/lit/dist@2.2.8/all/lit-all.min.js";
//import { choose } from "https://cdn.jsdelivr.net/gh/lit/dist@2.2.8/all/lit-all.min.js";

import {cleanPath} from "./utils.js"

export class tinycloud extends LitElement {
  static properties = { url: {} ,routes:{}};
  constructor() {
    super();
    if (location.hash.split("#")[1]){
    this.url = cleanPath(location.hash.split("#")[1]);}
    else{this.url="/"}
    window.addEventListener(
      "hashchange",
      () => {
        this.hashchange();
      },
      false
    );
    this.routes={"files":this.contentFiles}
  }
  hashchange() {
    this.url = cleanPath(location.hash.split("#")[1]||"/");
  }
  contentFiles() {
    var filelist = new tc_filelist();
    if (this.url) {
      filelist.url = this.url;
    }
    var fileupload = new tc_fileupload();
    fileupload.url = this.url;
    fileupload.uploadFinishedCallback = filelist.uploadFinishedCallback;
    fileupload.uploadProgressCallback = filelist.uploadProgressCallback;
    filelist.file_upload = fileupload;
    filelist.load_data();
    return html` ${filelist}${fileupload}`;
  }
  // Render the UI as a function of component state
  render() {
    console.log(this.routes[this.url.split("/")[0]])
    return html`<body>
      <div id="header">
        <p>Tinycloud0.1</p>
        <hr />
      </div>
      <div id="content">${this.contentFiles()}</div>
    </body>`;
  }
}

export class tc_filelist extends LitElement {
  static properties = {
    files: {},
    url: {},
    menu: {},
    file_upload: {},
    showHidden: {},
  };
  static styles = css`
    a {
      color: var(--tc-link-color, blue);
    }
    .mountpoint {
      color: green;
    }
    .broken {
      color: red;
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
          var mountPoint = [];
          files.forEach((item, index) => {
            if (item.type === "mountpoint") {
              mountPoint.push(item);
              files.splice(index, 1);
              return;
            }
          });
          if (mountPoint.length) {
            var i;
            for (i in mountPoint) {
              files.unshift(mountPoint[i]);
            }
          }
          this.files = files;
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
    fetch("/dav" + this.url + "/" + filename + "?json_mode=1", {
      method: "DELETE",
    }).then((res) => {
      if (res.ok) {
        this.load_data();
      }
    });
  };
  mkdir = (dirname) => {
    fetch("/dav" + this.url +"/"+ dirname + "?json_mode=1", {
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
        显示隐藏文件: () => {
          this.showHidden = !this.showHidden;
          localStorage.setItem("showHidden", this.showHidden);
        },
      };
      this.menu.show(e);
    }
  };
  constructor() {
    super();
    if (localStorage.getItem("showHidden") != null) {
      this.showHidden = localStorage.getItem("showHidden");
    } else {
      this.showHidden = false;
    }
    this.menu = new tc_contextmenu();
    var files;
    this.url = "/";

    //this.load_data(); //fetch("/dav/"+"/"+"?json_mode=1",{  method: 'PROPFIND'}).then(res=>{res.json().then(res=>this.files=res.files)})
    //    this.renderRoot.addEventListener("contextmenu",this.contextmenu)
  }
  hasFile(filename) {
    var i;
    for (i in this.files) {
      if (this.files[i].name == filename) {
        return Number(i);
      }
    }
  }
  scrollToFile(file) {
    var fileElement = this.shadowRoot.getElementById("file-" + file);
    fileElement.scrollIntoView({ behavior: "smooth" });
    fileElement.style.background = "gray";
    setTimeout(() => {
      fileElement.style.background = "";
    }, 1000);
  }
  uploadProgressCallback = (filename, finished,speed) => {
    var idx = this.hasFile(filename);
    if (!idx) {
      this.files.push({
        name: filename,
        type: "uploading",
        finished: finished,
        speed:speed
      });
      return 0;
    }
    this.files[idx].finished = finished;
    this.files[idx].speed=speed
    this.update();
  };
  uploadFinishedCallback = (filename) => {
    var idx = this.hasFile(filename);
    if (idx != -1) {
      this.files.pop(idx);
      this.files.push({
        name: filename,
        path: this.url + filename,
        type: "file",
      });
    }
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
    if (!this.showHidden) {
      var files = this.files.filter((file) => {
        if (file.name.startsWith(".")) {
          return false;
        }

        return true;
      });
    } else {
      var files = this.files;
    }

    var prev = this.url.split("/").slice(0, -2).join("/");
    if (this.url != "/") {
      prev = html`<a class=dir href=#${prev}>../</a></br>`;
    } else {
      prev = html``;
    }
    return html`
      ${this.menu}
      <strong>Path:${decodeURIComponent(this.url)}</strong></br>
      <div>
      
      ${prev}
      ${files.map(
        (file) =>
          html`${choose(file.type, [
            [
              "dir",
              () =>
                html`<a id=file-${file.name}  tc-filename=${file.name} class=dir href=#${this.url}/${file.name}/>${file.name}/</a>`,
            ],
            [
              "broken",
              () =>
                html`<a id=file-${file.name}  tc-filename=${file.name} class=broken href=#${this.url}/${file.name}/>${file.name}/</a>`,
            ],
            [
              "file",
              () =>
                html`<a class=file id=file-${file.name} tc-filename=${file.name} href=/dav/${this.url}/${file.name} download=${file.name}>${file.name}</a>`,
            ],
            [
              "uploading",
              () =>
                html`<a
                    class="file"
                    id="file-${file.name}"
                    tc-filename=${file.name}
                    style="background-image: linear-gradient(to right,gray ${file.finished}%, var(--tc-background) ${file.finished}%);"
                    >${file.name}</a
                  > - ${file.speed}`,
            ],
            [
              "mountpoint",
              () =>
                html`<a class=mountpoint id=file-${file.name} tc-filename=${file.name} href=#${this.url}/${file.name}>${file.name}</a>`,
            ],
          ])}</br>`
      )}</div>`;
  }
}

export class tc_fileupload extends LitElement {
  static properties = {
    url: {},
    uploadFinishedCallback: {},
    uploadProgressCallback: {},
    ol:{}
  };
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
    var xhr = new XMLHttpRequest();
    xhr.open("PUT", "/dav" + this.url + "/" + file.name + "/");
    xhr.onload = () => {
      if (xhr.status == 200) {
        this.uploadFinishedCallback(file.name);
      }
    };
    xhr.upload.onprogress = (e) => {
      var nt = new Date().getTime();//获取当前时间
      var pertime = (nt-ot)/1000; //计算出上次调用该方法时到现在的时间差，单位为s
      ot = new Date().getTime(); //重新赋值时间，用于下次计算
      var perload = e.loaded - this.ol; //计算该分段上传的文件大小，单位b
      this.ol = e.loaded; //重新赋值已上传文件大小，用以下次计算

      //上传速度计算
      var speed = perload / pertime; //单位b/s
      var bspeed = speed;
      var units = "b/s"; //单位名称
      if (speed / 1024 > 1) {
        speed = speed / 1024;
        units = "k/s";
      }
      if (speed / 1024 > 1) {
        speed = speed / 1024;
        units = "M/s";
      }
      speed = speed.toFixed(1);
      this.uploadProgressCallback(
        file.name,
        Math.round((e.loaded / e.total) * 100),speed+units
      );
      console.log(speed);
    };
    this.ol = 0; //设置上传开始时间
    var ot = new Date().getTime();
    xhr.send(file);
    //    fetch("/dav" + this.url + "/" + file.name, {
    //     method: "PUT",
    //    body: file,
    // }).then(() => this.uploadCallback(file.name));
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
