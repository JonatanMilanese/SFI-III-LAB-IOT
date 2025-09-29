using MQTTnet;
using MQTTnet.Client;
using MQTTnet.Protocol;

namespace MauiApp1;

public class MqttService
{
    private IMqttClient client;
    private MqttClientOptions options;

    public event Action<string>? OnState;
    public bool IsConnected => client?.IsConnected ?? false;

    public MqttService()
    {
        var factory = new MqttFactory();
        client = factory.CreateMqttClient();

        client.ApplicationMessageReceivedAsync += e =>
        {
            var topic = e.ApplicationMessage.Topic;
            var payload = e.ApplicationMessage.ConvertPayloadToString();

            if (topic == "lab/g1/led/state")
                OnState?.Invoke(payload);

            return Task.CompletedTask;
        };

        client.DisconnectedAsync += async e =>
        {
            Console.WriteLine("🔌 Desconectado del broker MQTT");
            await Task.Delay(2000);

            try
            {
                if (options != null)
                    await client.ConnectAsync(options);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error reconectando: {ex.Message}");
            }
        };

        // Configuración por defecto
        options = new MqttClientOptionsBuilder()
            .WithClientId("maui-client-" + Guid.NewGuid().ToString())
            .WithTcpServer("192.168.0.103", 5004)
            .WithCleanSession()
            .Build();
    }

    public async Task ConnectAsync(string host = "192.168.0.103", int port = 5004)
    {
        try
        {
            Console.WriteLine($"🔌 Intentando conectar a {host}:{port}");

            options = new MqttClientOptionsBuilder()
                .WithClientId("maui-client-" + Guid.NewGuid().ToString())
                .WithTcpServer(host, port)
                .WithCleanSession()
                .Build();

            if (!client.IsConnected)
            {
                await client.ConnectAsync(options);
                Console.WriteLine("✅ Conectado al broker MQTT");

                // Suscribirse al estado del LED
                await client.SubscribeAsync(new MqttTopicFilterBuilder()
                    .WithTopic("lab/g1/led/state")
                    .WithQualityOfServiceLevel(MqttQualityOfServiceLevel.AtLeastOnce)
                    .Build());

                Console.WriteLine("✅ Suscrito al tópico de estado");
            }
            else
            {
                Console.WriteLine("ℹ️ Ya conectado al broker");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error conectando: {ex.Message}");
            throw;
        }
    }

    public async Task PublishCmdAsync(string state)
    {
        try
        {
            if (!client.IsConnected)
            {
                Console.WriteLine("⚠️ No conectado, intentando conectar...");
                await ConnectAsync();
            }

            Console.WriteLine($"📤 Enviando: {state} al tópico: lab/g1/req/led");

            var message = new MqttApplicationMessageBuilder()
                .WithTopic("lab/g1/req/led")
                .WithPayload(state)
                .WithQualityOfServiceLevel(MqttQualityOfServiceLevel.AtLeastOnce)
                .WithRetainFlag(false)
                .Build();

            await client.PublishAsync(message);
            Console.WriteLine($"✅ Comando {state} enviado exitosamente");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error enviando comando: {ex.Message}");
            throw;
        }
    }

    public async Task DisconnectAsync()
    {
        try
        {
            if (client.IsConnected)
            {
                await client.DisconnectAsync();
                Console.WriteLine("✅ Desconectado del broker");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error desconectando: {ex.Message}");
        }
    }
}