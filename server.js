const http=require('http'),fs=require('fs'),path=require('path');
const T={'.html':'text/html;charset=utf-8','.js':'text/javascript','.css':'text/css'};
http.createServer((q,r)=>{let f=path.join(__dirname,q.url.split('?')[0]);if(f.endsWith(path.sep)||q.url==='/')f=path.join(__dirname,'index.html');
fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);return r.end('404')}r.writeHead(200,{'Content-Type':T[path.extname(f)]||'application/octet-stream'});r.end(d)})}).listen(5173);
