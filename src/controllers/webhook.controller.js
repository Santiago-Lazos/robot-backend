// Este archivo contiene las funciones que procesarán los datos
// que llegan al endpoint /api/webhook, según el "type" recibido.
// Aca se modulariza la lógica para mantener el código más limpio
// y facilitar la integración futura con MongoDB y Cloudflare R2.

// 🖼️ Procesar imagen
export async function handleImage(data, r2, bucketName) {
  try {
    console.log("📸 Procesando imagen recibida...");

    let imageBuffer;
    if (data?.base64) {
      const base64Data = data.base64.replace(/^data:image\/\w+;base64,/, "");
      imageBuffer = Buffer.from(base64Data, "base64");
    } else if (data?.buffer) {
      imageBuffer = Buffer.from(data.buffer);
    } else {
      console.warn("⚠️ No se recibió imagen válida.");
      return { ok: false, error: "No se recibió imagen válida." };
    }

    const fileName = `robot_${Date.now()}.jpg`;

    // Subir directamente a Cloudflare R2
    await r2
      .putObject({
        Bucket: bucketName,
        Key: fileName,
        Body: imageBuffer,
        ContentType: "image/jpeg",
      })
      .promise();

    const imageUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;
    console.log("✅ Imagen subida correctamente:", imageUrl);

    return {
      ok: true,
      type: "image",
      url: imageUrl,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("❌ Error al manejar imagen:", error.message);
    return { ok: false, error: error.message };
  }
}

// 📊 Procesar estado del robot
export async function handleStatus(data) {
  try {
    console.log("📊 Estado recibido:", data);
    // Futuro: guardar estado en MongoDB
    return { ok: true, type: "status", data };
  } catch (error) {
    console.error("❌ Error al manejar estado:", error.message);
    return { ok: false, error: error.message };
  }
}

// 📡 Procesar datos de sensores
export async function handleSensor(data) {
  try {
    console.log("📡 Sensor recibido:", data);
    // Futuro: guardar lecturas de sensores en MongoDB
    return { ok: true, type: "sensor", data };
  } catch (error) {
    console.error("❌ Error al manejar sensor:", error.message);
    return { ok: false, error: error.message };
  }
}
