export async function send_http_get(url: string): Promise<Response> {
    const requestOptions = {
        method: 'GET',
        credentials: 'include' as RequestCredentials,
    }

    try {
        // Enviamos la solicitud HTTP
        const response = await fetch(url, requestOptions)

        // Verificamos si hay algun error
        if (!response.ok){
            const errorText = await response.text()
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
        }

        // Esperamos el payload
        const payload = await response.json()

        // Retornamos resultado
        return payload

    } catch (error) {
        console.error("Error en la solicitud HTTP:", error)
        throw error
    }
}

export async function send_http_post(url: string, json: any): Promise<Response> {
    const jsonParsed = JSON.stringify(json)

    const requestOptions = {
        method: 'POST',
        credentials: 'include' as RequestCredentials,
        headers: {'Content-Type': 'application/json'},
        body: jsonParsed,
    }

    try {
        // Enviamos la solicitud HTTP
        const response = await fetch(url, requestOptions)

        // Verificamos si hay algun error
        if (!response.ok){
            const errorText = await response.text()
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
        }

        // Esperamos el payload
        const payload = await response.json()

        // Retornamos resultado
        return payload

    } catch (error) {
        console.error("Error en la solicitud HTTP:", error)
        throw error
    }
}

export async function send_http_patch(url: string, json: any): Promise<Response> {
    const jsonParsed = JSON.stringify(json)
    

    const requestOptions = {
        method: 'PATCH',
        credentials: 'include' as RequestCredentials,
        headers: {'Content-Type': 'application/json'},
        body: jsonParsed,
    }

    try {
        // Enviamos la solicitud HTTP
        const response = await fetch(url, requestOptions)

        // Verificamos si hay algun error
        if (!response.ok){
            const errorText = await response.text()
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
        }

        // Esperamos el payload
        const payload = await response.json()

        // Retornamos resultado
        return payload

    } catch (error) {
        console.error("Error en la solicitud HTTP:", error)
        throw error
    }
}