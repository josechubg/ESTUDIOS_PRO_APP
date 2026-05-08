# SEGURIDAD DE API KEYS - ESTUDIOS PRO

## Regla principal

Nunca subas claves reales a GitHub.

Una clave como `OPENAI_API_KEY` permite consumir servicios de pago. Si se publica, cualquier persona podria usarla y generar costes o acceder a capacidades privadas del proyecto.

## Uso correcto de `.env`

El archivo `.env` local debe usarse solo en la maquina de desarrollo o en el servidor. No debe versionarse.

Ejemplo local futuro:

```env
OPENAI_API_KEY=tu_clave_real_solo_en_local
AI_PROVIDER=openai
AI_MODEL=gpt-5.5-thinking
API_MODE=real_api_ready
```

El repositorio solo debe incluir `.env.example`, que funciona como plantilla sin secretos.

## `.env.example`

`03_APP/.env.example` documenta las variables esperadas:

- `OPENAI_API_KEY`: marcador de posicion, nunca clave real.
- `AI_PROVIDER`: proveedor previsto.
- `AI_MODEL`: modelo previsto.
- `API_MODE`: `simulation` o `real_api_ready`.

## Simulacion frente a API real

Modo `simulation`:

- Es el modo actual.
- No llama a OpenAI.
- No necesita claves.
- Usa respuestas simuladas en `aiService.js`.

Modo `real_api_ready`:

- Prepara el payload para IA real.
- Todavia no hace llamadas reales.
- Debe pasar por backend seguro.
- La clave debe vivir en variables de entorno del backend, no en el navegador.

## Si una clave se filtra

1. Revoca inmediatamente la clave en el panel del proveedor.
2. Crea una clave nueva.
3. Revisa el historial de Git para eliminar secretos si llegaron a commits.
4. Revisa logs y consumo de la cuenta.
5. Actualiza `.gitignore` si el archivo filtrado no estaba excluido.
6. No reutilices la clave filtrada.

## Arquitectura segura recomendada

Frontend:

- Muestra la interfaz.
- Construye la solicitud educativa.
- Nunca guarda claves.

Backend:

- Lee `.env`.
- Llama a OpenAI.
- Aplica prompts, fuentes y validaciones.
- Devuelve solo la respuesta necesaria al frontend.

Esta separacion evita exponer claves en GitHub, navegador o herramientas de inspeccion.
