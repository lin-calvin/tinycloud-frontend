import { LitElement, html, css } from "lit";

export class tc_settings extends LitElement {
  static properties = { content: {} };
  static styles = css`
    pre {
      margin: 0px;
    }
  `;
  constructor() {
    super();
  }

  loadData() {
    fetch("/api/confmgr").then((resp) => {
      resp.json().then((res) => {
        this.content = res;
      });
    });
  }
  save() {
    var items = this.shadowRoot.querySelectorAll("input"); //.configItem");

    for (var i of items.keys()) {
      var path = items[i].getAttribute("tc-config-tree").split("-");
      var value = items[i].value;
      var orig = this.content;
      for (var n in path.slice(0, -1)) {
        orig = orig[path[n]];
      }
      orig[path.slice(-1)] = value;
    }
  }
  render() {
    if (this.content) {
      var h = [];
      var lavel = 0;
      var genHtml = (obj, lavel, name) => {
        if (typeof obj != "object") {
          return html`<input class=configItem tc-config-tree=${name.slice(
            1
          )} value=${obj}></input>`;
        }
        var ret = [];
        for (var i in obj) {
          ret.push(
            html`<pre>${"  ".repeat(lavel)} ${i}:${genHtml(
              obj[i],
              lavel + 1,
              [name, i].join("-")
            )}<pre>`
          );
        }
        //          ret.push(html`<pre>${"   ".repeat(lavel)}<button>New</button><pre>`)
        return ret;
      };
      h = genHtml(this.content, 0, "");
      return html`${h}<button>Summit</button>`;
    }
  }
}
customElements.define("tc-settings", tc_settings);
