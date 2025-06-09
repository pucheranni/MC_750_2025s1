# pico_controller_completo.py
from machine import Pin, UART
import time

# --- Configuração ---
# UART para o Micro:bit (GP4 -> RX do Micro:bit)
uart_to_microbit = UART(1, baudrate=9600, tx=Pin(4), rx=Pin(5))

# Encoder Rotativo
CLK_PIN_NUM = 14
DT_PIN_NUM = 15
clk_pin = Pin(CLK_PIN_NUM, Pin.IN)
dt_pin = Pin(DT_PIN_NUM, Pin.IN)

# NOVO: Botões de evento (usando pinos livres)
BTN_NEXT_PIN_NUM = 17  # Botão para "NEXT"
BTN_PREV_PIN_NUM = 16  # Botão para "PREV"

# Configura os botões como entrada com resistor de pull-up interno
btn_next = Pin(BTN_NEXT_PIN_NUM, Pin.IN, Pin.PULL_UP)
btn_prev = Pin(BTN_PREV_PIN_NUM, Pin.IN, Pin.PULL_UP)

# --- Variáveis de Estado ---
ANO_INICIAL = 1964
ANO_FINAL = 1985 # Ajuste este valor se necessário
ano_atual = ANO_INICIAL
ultimo_estado_clk = clk_pin.value()
ultimo_ano_enviado = -1 # Força o envio na primeira vez

print("--- Pico Pronto ---")
print("Comunicando com PC (USB) e Micro:bit (UART)")

try:
    while True:
        # --- NOVO: Lógica para ler os botões e enviar comandos ---
        if not btn_prev.value():
            # Envia o comando para ambos os destinos
            print("PREV")
            uart_to_microbit.write("PREV\n")
            time.sleep(0.3) # Debounce para evitar repetições

        if not btn_next.value():
            # Envia o comando para ambos os destinos
            print("NEXT")
            uart_to_microbit.write("NEXT\n")
            time.sleep(0.3) # Debounce

        # --- Lógica de leitura do encoder para mudar o ANO ---
        estado_clk_atual = clk_pin.value()
        if estado_clk_atual != ultimo_estado_clk:
            if estado_clk_atual == 1:
                if dt_pin.value() != estado_clk_atual:
                    ano_atual -= 1
                else:
                    ano_atual += 1

                # Garante que o ano permaneça nos limites
                if ano_atual > ANO_FINAL:
                    ano_atual = ANO_FINAL
                if ano_atual < ANO_INICIAL:
                    ano_atual = ANO_INICIAL

        ultimo_estado_clk = estado_clk_atual

        # --- Lógica de envio do ANO (apenas se ele mudar) ---
        if ano_atual != ultimo_ano_enviado:
            ano_str_completo = str(ano_atual)

            # 1. Envia para o PC via USB Serial
            print(ano_str_completo)

            # 2. Envia para o Micro:bit via UART (linha ativada)
            uart_to_microbit.write(ano_str_completo + '\n')

            ultimo_ano_enviado = ano_atual
            time.sleep_ms(50) # Debounce para estabilizar o envio

        time.sleep_ms(1) # Pequena pausa para não sobrecarregar o processador

except KeyboardInterrupt:
    print("Programa Pico encerrado.")
    uart_to_microbit.deinit()
