#!/bin/bash
vermelho="\e[31m"
verde="\e[32m"
amarelo="\e[33m"
azul="\e[34m"
roxo="\e[38;2;128;0;128m"
reset="\e[0m"


if [ -f /etc/systemd/system/apicheckuser.service ]; then
    sudo systemctl stop apicheckuser.service
    sudo systemctl disable apicheckuser.service
    sudo rm /etc/systemd/system/apicheckuser.service
    sudo systemctl daemon-reload
fi

            
pkill -9 -f "/root/JsApiUlekCheckuser/main.js"
rm -rf /root/JsApiUlekCheckuser/
rm -f /usr/local/bin/ulekCheckuser


apt update -y && apt upgrade -y
apt install curl git -y

curl -fsSL https://bun.sh/install | bash
source /root/.bashrc 

git clone https://github.com/UlekBR/JsApiUlekCheckuser.git
chmod +x /root/JsApiUlekCheckuser/apiMenu.sh
chmod +x /root/JsApiUlekCheckuser/init.sh
ln -s /root/JsApiUlekCheckuser/apiMenu.sh /usr/local/bin/menuApiCheckuser

clear
echo -e "Para iniciar o menu digite: ${verde}menuApiCheckuser${reset}"
