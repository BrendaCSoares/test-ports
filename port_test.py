import socket

ip = input("Digite o IP: ")
ports = [1024, 443, 80, 8080, 7575, 1025, 1026, 1023, 9085, 8095]

for port in ports:
    client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    client.settimeout(0.5)

    result = client.connect_ex((ip, port))

    if result == 0:
        print(f"Porta {port} ABERTA")
    else:
        print(f"Porta {port} FECHADA")

    client.close()