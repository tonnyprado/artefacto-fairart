/**
 * SCRIPT DE DIAGNÓSTICO PARA USUARIOS CON ERROR "FAILED TO FETCH"
 *
 * INSTRUCCIONES:
 * 1. Abre la consola del navegador (F12 o clic derecho > Inspeccionar > Consola)
 * 2. Copia y pega TODO este código en la consola
 * 3. Presiona Enter
 * 4. Toma screenshot de los resultados y envía al administrador
 */

(async function diagnosticar() {
  console.clear()
  console.log('%c🔍 DIAGNÓSTICO DE CONEXIÓN - ARTE-FACTO', 'color: #B83030; font-size: 20px; font-weight: bold')
  console.log('%c='.repeat(60), 'color: #B83030')

  const resultados = {
    fecha: new Date().toISOString(),
    url_actual: window.location.href,
    navegador: navigator.userAgent,
    online: navigator.onLine,
    tests: []
  }

  // Test 1: ¿Está online?
  console.log('\n%c[1/5] Verificando conexión a internet...', 'color: blue; font-weight: bold')
  const testOnline = {
    nombre: 'Conexión a Internet',
    resultado: navigator.onLine ? '✅ CONECTADO' : '❌ SIN CONEXIÓN',
    detalles: navigator.onLine ? 'El navegador está online' : 'El navegador está offline'
  }
  console.log(`   ${testOnline.resultado} - ${testOnline.detalles}`)
  resultados.tests.push(testOnline)

  // Test 2: ¿Cuál API URL está usando?
  console.log('\n%c[2/5] Detectando URL del API...', 'color: blue; font-weight: bold')
  const apiUrl = 'https://artefacto-fairart-production.up.railway.app/api'
  const testApiUrl = {
    nombre: 'URL del API',
    resultado: apiUrl,
    detalles: 'URL que el frontend intenta usar'
  }
  console.log(`   📍 ${apiUrl}`)
  resultados.tests.push(testApiUrl)

  // Test 3: Health check del backend
  console.log('\n%c[3/5] Verificando si el backend responde...', 'color: blue; font-weight: bold')
  let testHealth = {
    nombre: 'Health Check Backend',
    resultado: '',
    detalles: ''
  }

  try {
    const healthUrl = apiUrl.replace('/api', '/health')
    console.log(`   Consultando: ${healthUrl}`)

    const healthRes = await fetch(healthUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    })

    if (healthRes.ok) {
      const data = await healthRes.json()
      testHealth.resultado = '✅ BACKEND ACTIVO'
      testHealth.detalles = `Status: ${data.status}, Timestamp: ${data.timestamp}`
      console.log(`   ✅ Backend responde correctamente`)
      console.log(`   Respuesta:`, data)
    } else {
      testHealth.resultado = '❌ BACKEND ERROR'
      testHealth.detalles = `HTTP ${healthRes.status}: ${healthRes.statusText}`
      console.error(`   ❌ Backend respondió con error: ${healthRes.status}`)
    }
  } catch (error) {
    testHealth.resultado = '❌ NO SE PUEDE CONECTAR'
    testHealth.detalles = error.message
    console.error(`   ❌ Error: ${error.message}`)
  }
  resultados.tests.push(testHealth)

  // Test 4: Test de CORS con endpoint público
  console.log('\n%c[4/5] Probando CORS...', 'color: blue; font-weight: bold')
  let testCORS = {
    nombre: 'Prueba CORS',
    resultado: '',
    detalles: ''
  }

  try {
    const faseRes = await fetch(`${apiUrl}/fases`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    if (faseRes.ok) {
      testCORS.resultado = '✅ CORS FUNCIONA'
      testCORS.detalles = 'Las peticiones cross-origin están permitidas'
      console.log(`   ✅ CORS configurado correctamente`)
    } else {
      testCORS.resultado = '❌ CORS ERROR'
      testCORS.detalles = `HTTP ${faseRes.status}`
      console.error(`   ❌ Error de CORS o endpoint: ${faseRes.status}`)
    }
  } catch (error) {
    testCORS.resultado = '❌ CORS BLOQUEADO'
    testCORS.detalles = error.message
    console.error(`   ❌ Error: ${error.message}`)

    if (error.message.includes('CORS')) {
      console.error(`   💡 Posible problema de CORS - el servidor está bloqueando peticiones desde este origen`)
    }
  }
  resultados.tests.push(testCORS)

  // Test 5: Simular petición de pre-registro
  console.log('\n%c[5/5] Simulando pre-registro...', 'color: blue; font-weight: bold')
  let testPreregistro = {
    nombre: 'Pre-registro (simulado)',
    resultado: '',
    detalles: ''
  }

  try {
    const testData = {
      email: `test-${Date.now()}@example.com`,
      nombre: 'Test',
      apellido: 'Diagnóstico',
      ubicacion: 'Ciudad MX'
    }

    console.log(`   Enviando datos de prueba:`, testData)

    const preregRes = await fetch(`${apiUrl}/preregistro`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    })

    if (preregRes.ok || preregRes.status === 400 || preregRes.status === 409) {
      // 200 = creado, 400 = error validación, 409 = ya existe
      // Todos indican que el endpoint está funcionando
      testPreregistro.resultado = '✅ ENDPOINT FUNCIONA'
      testPreregistro.detalles = `HTTP ${preregRes.status} - El servidor puede recibir peticiones`
      console.log(`   ✅ El endpoint de pre-registro responde (${preregRes.status})`)
    } else {
      testPreregistro.resultado = '⚠️ RESPUESTA INESPERADA'
      testPreregistro.detalles = `HTTP ${preregRes.status}`
      console.warn(`   ⚠️ Respuesta inesperada: ${preregRes.status}`)
    }
  } catch (error) {
    testPreregistro.resultado = '❌ ERROR AL CONECTAR'
    testPreregistro.detalles = error.message
    console.error(`   ❌ Error: ${error.message}`)
  }
  resultados.tests.push(testPreregistro)

  // Resumen final
  console.log('\n%c='.repeat(60), 'color: #B83030')
  console.log('%c📊 RESUMEN DE DIAGNÓSTICO', 'color: #B83030; font-size: 16px; font-weight: bold')
  console.log('%c='.repeat(60), 'color: #B83030')

  const totalTests = resultados.tests.length
  const testsExitosos = resultados.tests.filter(t => t.resultado.includes('✅')).length
  const testsFallidos = resultados.tests.filter(t => t.resultado.includes('❌')).length

  console.log(`\n📈 Tests exitosos: ${testsExitosos}/${totalTests}`)
  console.log(`❌ Tests fallidos: ${testsFallidos}/${totalTests}\n`)

  resultados.tests.forEach((test, i) => {
    console.log(`${i + 1}. ${test.nombre}:`)
    console.log(`   ${test.resultado}`)
    console.log(`   ${test.detalles}\n`)
  })

  // Recomendaciones
  console.log('\n%c💡 RECOMENDACIONES', 'color: green; font-size: 14px; font-weight: bold')
  console.log('%c='.repeat(60), 'color: green')

  if (!navigator.onLine) {
    console.log('❌ Sin conexión a internet')
    console.log('   → Verifica tu conexión WiFi/datos móviles')
  } else if (testHealth.resultado.includes('❌')) {
    console.log('❌ El backend no responde')
    console.log('   → El servidor puede estar caído o en mantenimiento')
    console.log('   → Contacta al administrador del sistema')
  } else if (testCORS.resultado.includes('❌')) {
    console.log('❌ Problema de CORS detectado')
    console.log('   → Tu origen no está permitido en el servidor')
    console.log('   → Verifica que estés usando https://arte-facto.mx')
  } else if (testPreregistro.resultado.includes('❌')) {
    console.log('❌ Problema con el endpoint de registro')
    console.log('   → Puede haber un problema temporal con el servidor')
    console.log('   → Intenta de nuevo en unos minutos')
  } else {
    console.log('✅ Todo parece estar funcionando correctamente')
    console.log('   → El error puede ser temporal')
    console.log('   → Intenta refrescar la página (Ctrl+F5 / Cmd+Shift+R)')
    console.log('   → Limpia el caché del navegador')
  }

  console.log('\n%c📋 COPIA ESTE OBJETO Y ENVÍALO AL ADMINISTRADOR:', 'color: orange; font-size: 14px; font-weight: bold')
  console.log(JSON.stringify(resultados, null, 2))

  return resultados
})()
