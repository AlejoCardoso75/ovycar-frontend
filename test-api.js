// Script para probar la API del backend
const API_URL = 'http://localhost:8080/api';

async function testAPI() {
  console.log('🔍 Probando conexión con el backend...');
  
  try {
    // Probar endpoint de productos
    const response = await fetch(`${API_URL}/productos`);
    
    if (response.ok) {
      const productos = await response.json();
      console.log('✅ Conexión exitosa con el backend');
      console.log(`📦 Se encontraron ${productos.length} productos`);
      
      if (productos.length > 0) {
        console.log('📋 Primeros productos:');
        productos.slice(0, 3).forEach((producto, index) => {
          console.log(`  ${index + 1}. ${producto.nombre} - $${producto.precioVenta}`);
        });
      } else {
        console.log('⚠️ No hay productos en la base de datos');
      }
    } else {
      console.log('❌ Error en la respuesta del servidor:', response.status);
    }
  } catch (error) {
    console.log('❌ Error de conexión:', error.message);
    console.log('💡 Asegúrate de que el backend esté ejecutándose en http://localhost:8080');
  }
}

// Ejecutar la prueba
testAPI(); 