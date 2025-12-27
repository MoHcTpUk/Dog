#!/bin/bash

if ! grep -q "127.0.0.1 auth.dogappa.local" /etc/hosts; then
    echo "127.0.0.1 auth.dogappa.local" | sudo tee -a /etc/hosts
fi

if ! grep -q "127.0.0.1 dogappa.local" /etc/hosts; then
    echo "127.0.0.1 dogappa.local" | sudo tee -a /etc/hosts
fi

if ! grep -q "127.0.0.1 app.dogappa.local" /etc/hosts; then
    echo "127.0.0.1 app.dogappa.local" | sudo tee -a /etc/hosts
fi

if ! grep -q "127.0.0.1 api.dogappa.local" /etc/hosts; then
    echo "127.0.0.1 api.dogappa.local" | sudo tee -a /etc/hosts
fi