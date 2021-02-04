var path = require('path')
const fs = require("fs");
const https = require('https');

const base = "./docs/chapters"

const OrgName = "infineq"

var SideBar_Template = ""

const main = () => {

  SideBar_Template += "<!-- docs/_sidebar.md -->\n"

  fs.readdirSync(base).forEach(chapter => {

    chapterformat = "- " + chapter.slice(2, chapter.length).replace(/-/g, " ") + "\n\n"
    SideBar_Template += chapterformat

    fs.readdirSync(base + "/" + chapter).forEach(list => {

      if (!list.includes('.txt')) {
        listformat = "  - <span>" + list.slice(2, list.length).replace(/-/g, " ") + "</span>" + "\n"
        SideBar_Template += listformat

        fs.readdirSync(base + "/" + chapter + "/" + list).forEach(file => {


          if (file.endsWith(".md") && !file.includes('.txt')) {
            fileformat = "    - [" + file.replace(/-/g, " ").replace(/.md/g, "") + "](/chapters/" + chapter + "/" + list + "/" + file + ")" + "\n"
            SideBar_Template += fileformat
            let CommitFile = fs.readFileSync(base + "/" + chapter + "/" + list + "/" + file).toString('utf-8')

            if (CommitFile.length > 0) {
              const index = CommitFile.search("This page was last updated");

              const start = index + 30

              const end = index + 45

              var options = {
                host: 'api.github.com',
                path: "/repos/" + OrgName + "/docs/commits?path=docs/chapters" + "/" + chapter + "/" + list + "/" + file + "&page=1&per_page=1",
                method: 'GET',
                headers: { 'user-agent': 'node.js' }
              };

              https.get(options, (resp) => {
                let data = '';

                resp.on('data', (chunk) => {
                  data += chunk;
                });

                resp.on('end', () => {
                  var date = new Date(JSON.parse(data)[0]['commit']['committer']['date']).toDateString()
                  let UpdateCommitDate = CommitFile.slice(start, end)
                  CommitFile = CommitFile.replace(UpdateCommitDate, date);
                  fs.writeFileSync(base + "/" + chapter + "/" + list + "/" + file, CommitFile)
                });

              }).on("error", (err) => {
                console.log("Error: " + err.message);
              });
            }

            let README = fs.readFileSync("./docs/README.md").toString('utf-8')

            if (README.length > 0) {
              const index = README.search("This page was last updated");

              const start = index + 30

              const end = index + 45

              var options = {
                host: 'api.github.com',
                path: "/repos/" + OrgName + "/docs/commits?path=README.md&page=1&per_page=1",
                method: 'GET',
                headers: { 'user-agent': 'node.js' }
              };

              https.get(options, (resp) => {
                let data = '';

                resp.on('data', (chunk) => {
                  data += chunk;
                });

                resp.on('end', () => {
                  var date = new Date(JSON.parse(data)[0]['commit']['committer']['date']).toDateString()
                  let UpdateCommitDate = README.slice(start, end)
                  README = README.replace(UpdateCommitDate, date);
                  fs.writeFileSync("./docs/README.md", README)
                });

              }).on("error", (err) => {
                console.log("Error: " + err.message);
              });
            }
          }

        })
      }

    })
  })
}

main()

fs.writeFileSync("./docs/_sidebar.md", SideBar_Template);
