import { createServer } from 'http';
import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';

const server = createServer((req, res) => {
    const { url, method } = req;

    if (url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Bem vindo a api Checkuser');
    } else if (url.startsWith('/user=')) {
        const username = url.split('user=')[1];

        try {
            const userExists = parseInt(execSync(`/bin/grep -wc ${username} /etc/passwd`)) !== 0;

            if (userExists) {
                let expirationDate = execSync(`chage -l ${username} | grep -i co | awk -F : '{print $2}'`, { encoding: 'utf-8' }).trim();
                const formattedExpirationDate = formatDate(expirationDate);
                const formattedExpirationDateForAny = formatDateForAnymod(expirationDate);

                let limit = 0;
                if (existsSync('/root/usuarios.db')) {
                    limit = execSync(`grep -w ${username} /root/usuarios.db | cut -d' ' -f2 | head -n 1`, { encoding: 'utf-8' }).trim();
                } else if (existsSync('/opt/DragonCore')) {
                    limit = execSync(`php /opt/DragonCore/menu.php printlim | awk '/${username}/ {print $3}'`, { encoding: 'utf-8' }).trim();
                } else {
                    limit = 999;
                }

                const sshConnections = execSync(`ps -u ${username} | grep sshd | wc -l`, { encoding: 'utf-8' }).trim();
                const remainingDays = calculateRemainingDays(formattedExpirationDate).toString();

                const userInfo = {
                    username: username,
                    user_connected: sshConnections,
                    user_limit: limit,
                    expiration_date: expirationDate,
                    formatted_expiration_date: formattedExpirationDate,
                    formatted_expiration_date_for_anymod: formattedExpirationDateForAny,
                    remaining_days: remainingDays
                };

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(userInfo));
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end(`User ${username} not found`);
            }
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end(error.message);
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

const port = readFileSync('/root/JsApiUlekCheckuser/porta.txt', 'utf8');
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

function formatDate(dateString) {
    const [month, day, year] = dateString.replace(',', '').split(' ');

    const monthMap = {
        Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
        Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
    };

    const formattedMonth = monthMap[month];
    const formattedDay = day;

    return `${formattedDay}/${formattedMonth}/${year}`;
}

function formatDateForAnymod(dateString) {
    const [month, day, year] = dateString.replace(',', '').split(' ');

    const monthMap = {
        Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
        Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
    };

    const formattedMonth = monthMap[month];
    const formattedDay = day;

    return `${year}-${formattedMonth}-${formattedDay}-`;
}


function calculateRemainingDays(dateString) {
    const [day, month, year] = dateString.split("/").map(Number);
    const inputDate = new Date(year, month - 1, day);
    const today = new Date();
    const difference = inputDate.getTime() - today.getTime(); // calcular a diferença em milissegundos
    return Math.max(Math.ceil(difference / (1000 * 60 * 60 * 24)), 0);
}
