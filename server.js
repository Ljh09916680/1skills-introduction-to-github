const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/save-image') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const { filename, data } = JSON.parse(body);
                
                // 验证文件路径
                if (!filename || typeof filename !== 'string') {
                    throw new Error('无效的文件名');
                }

                // 确保文件路径是PNG格式
                if (!filename.toLowerCase().endsWith('.png')) {
                    throw new Error('文件必须是PNG格式');
                }

                // 确保目标文件夹存在
                const dir = path.dirname(filename);
                try {
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir, { recursive: true });
                    }
                } catch (err) {
                    throw new Error(`创建目录失败：${err.message}`);
                }

                // 验证Base64数据
                if (!data || typeof data !== 'string') {
                    throw new Error('无效的图片数据');
                }

                // 将Base64数据转换为二进制并保存
                try {
                    const buffer = Buffer.from(data, 'base64');
                    fs.writeFileSync(filename, buffer);
                } catch (err) {
                    throw new Error(`保存文件失败：${err.message}`);
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (error) {
                console.error('保存图片时出错：', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: error.message }));
            }
        });
    } else {
        // 处理静态文件请求
        const filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
        fs.readFile(filePath, (error, content) => {
            if (error) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('File not found');
                return;
            }

            const ext = path.extname(filePath);
            const contentType = {
                '.html': 'text/html',
                '.js': 'text/javascript',
                '.css': 'text/css',
                '.png': 'image/png',
                '.jpg': 'image/jpeg'
            }[ext] || 'application/octet-stream';

            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        });
    }
});

const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});