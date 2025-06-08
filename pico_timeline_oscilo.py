# pico_encoder_sender_CORRIGIDO.py
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

# --- Variáveis de Estado ---
ANO_INICIAL = 1964
ANO_FINAL = 1985
ano_atual = ANO_INICIAL
ultimo_estado_clk = clk_pin.value()
ultimo_ano_enviado = -1 # Força o envio na primeira vez

print("--- Pico Pronto ---")

try:
    while True:
        # A lógica principal de atualização só ocorre se o ano MUDOU.
        if ano_atual != ultimo_ano_enviado:
            ano_str_completo = str(ano_atual)
            
            # 1. Envia para o PC via USB Serial
            print(ano_str_completo)
            
            # 2. Envia para o Micro:bit via UART
            uart_to_microbit.write(ano_str_completo + '\n')
            
            ultimo_ano_enviado = ano_atual
            time.sleep_ms(50) # Debounce para estabilizar o envio

        # Lógica de leitura do encoder
        estado_clk_atual = clk_pin.value()
        if estado_clk_atual != ultimo_estado_clk:
            if estado_clk_atual == 1:
                # Lógica invertida, se necessário. Ajuste aqui.
                # Se dt_pin.value() == 0 -> Sentido Horário
                # Se dt_pin.value() == 1 -> Sentido Anti-horário
                if dt_pin.value() != estado_clk_atual: 
                    ano_atual -= 1 # 
                else:
                    ano_atual += 1 # 
                
                # Garante que o ano permaneça nos limites definidos
                if ano_atual > ANO_FINAL:
                    ano_atual = ANO_FINAL
                if ano_atual < ANO_INICIAL:
                    ano_atual = ANO_INICIAL
        
        ultimo_estado_clk = estado_clk_atual
        time.sleep_ms(1) # Pequena pausa para não sobrecarregar o processador

except KeyboardInterrupt:
    print("Programa Pico encerrado.")
    uart_to_microbit.deinit()