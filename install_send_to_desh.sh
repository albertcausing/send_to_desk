#!/bin/bash

python -V >/dev/null 2>&1 || { echo >&2 "python is not installed. Aborting."; exit 1; }

echo -n "Please enter your Intercom APP ID: "
read intercom_app_id

echo -n "Please enter your Intercom KEY (input hidden): "
read -s intercom_key
echo

echo -n "Please enter your Desk email address: "
read desk_email

echo -n "Please enter your Desk password. This will be stored locally in /usr/local/bin/send_to_desk (input hidden): "
read -s desk_password
echo

curl -O https://raw.githubusercontent.com/alexdicianu/send_to_desk/master/send_to_desk

sed -i .txt "s/INTERCOM_APPID/$intercom_app_id/" send_to_desk ; rm send_to_desk.txt
sed -i .txt "s/INTERCOM_KEY/$intercom_key/" send_to_desk ; rm send_to_desk.txt
sed -i .txt "s/DESK_USER/$desk_email/" send_to_desk ; rm send_to_desk.txt
sed -i .txt "s/DESK_PASS/$desk_password/" send_to_desk ; rm send_to_desk.txt

chmod +x send_to_desk

mv send_to_desk /usr/local/bin/send_to_desk

echo "Installation complete."
