var path = require('path')
const fs = require("fs");
const https = require('https');

const base = "./docs/chapters"

const OrgName = "infineq"

var SideBar_Template = ""

const main = () => {

  SideBar_Template += "<!-- docs/_sidebar.md -->\n"

  fs.readdirSync(base).forEach(chapter => {

    if(chapter.startsWith("$")){
      chapterformat = "- " + chapter.slice(3, chapter.length).replace(/-/g, " ") + "\n\n"
      SideBar_Template += chapterformat
  
      fs.readdirSync(base + "/" + chapter).forEach(list => {
        if (list.endsWith(".md")) {
          listformat = "  - [" + list.slice(0, list.length-3).replace(/-/g, " ") + "](/chapters/" + chapter + "/" + list + ")" + "\n"
          SideBar_Template += listformat
        }
        else{
          if(!list.includes(".")){
            listformat = "  - <span>" + list.slice(3, list.length).replace(/-/g, " ") + "</span>" + "\n"
            SideBar_Template += listformat
          }
        }
        if (list.startsWith("$")) {
        

          fs.readdirSync(base + "/" + chapter + "/" + list).forEach(file => {
  
  
            if (file.endsWith(".md") && !file.includes('.txt')) {
              fileformat = "    - [" + file.replace(/-/g, " ").replace(/.md/g, "") + "](/chapters/" + chapter + "/" + list + "/" + file + ")" + "\n"
              SideBar_Template += fileformat
              let CommitFile = fs.readFileSync(base + "/" + chapter + "/" + list + "/" + file).toString('utf-8')
  
              if (CommitFile.length > 0) {
                const index = CommitFile.search("This page was last updated");
  
                const start = index + 30
  
                const end = index + 41
  
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
                    try {
                      var date = new Date(JSON.parse(data)[0]['commit']['committer']['date']).toDateString()
                      let UpdateCommitDate = CommitFile.slice(start, end)
                      CommitFile = CommitFile.replace(UpdateCommitDate, date.slice(4, date.length));
                      fs.writeFileSync(base + "/" + chapter + "/" + list + "/" + file, CommitFile)
                    } catch (error) {
                      console.log("Some error in ready last commit of sidebar files");
                    }
                  });
  
                }).on("error", (err) => {
                  console.log("Error: " + err.message);
                });
              }
  
              let README = fs.readFileSync("./docs/README.md").toString('utf-8')
  
              if (README.length > 0) {
                const index = README.search("This page was last updated");
  
                const start = index + 30
  
                const end = index + 41
  
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
                    try {
                      var date = new Date(JSON.parse(data)[0]['commit']['committer']['date']).toDateString()
                      let UpdateCommitDate = README.slice(start, end)
                      README = README.replace(UpdateCommitDate, date.slice(4, date.length));
                      fs.writeFileSync("./docs/README.md", README)
                    } catch (error) {
                      console.log("Some error in ready last commit of README");
                    }
                  });
  
                }).on("error", (err) => {
                  console.log("Error: " + err.message);
                });
              }
            }
  
          })
        }
      })
    }

  })
}

try {
  main() 
  fs.writeFileSync("./docs/_sidebar.md", SideBar_Template);
  console.log("Program Executed without any errors");
} catch (error) {
  console.log("Program Executed with some errors");
}

