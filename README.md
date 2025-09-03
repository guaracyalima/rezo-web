# Descritivo Completo do Projeto: Plataforma Global para Casas de Rezo

## Introdução ao Projeto

O projeto é uma plataforma web global e mobile-first (acessível via site, app iOS e Android), projetada para conectar usuários a casas de rezo, pontos de luz, institutos xamânicos e espaços religiosos semelhantes. O foco inicial é em tradições brasileiras e latino-americanas, como Santo Daime, xamanismo, Barquinha, Umbanda, Jurema e Quimbanda, com expansão possível para outras como Candomblé, Tambor de Mina ou práticas indígenas globais. A plataforma facilita a descoberta, filtragem, agendamento de atendimentos ou eventos espirituais, promovendo preservação cultural, inclusão e respeito às tradições religiosas.

A plataforma permite que usuários encontrem casas baseadas em localização (cidade/UF/país), culto ou tipo de atendimento, com detalhes como endereço, fotos, dirigente, calendário, avaliações e lojinha opcional. Dirigentes/owners gerenciam casas, eventos, atendimentos e produtos, com monetização via comissões (10% em reservas e vendas via Stripe). Ênfase em sensibilidade cultural: verificação de autenticidade, denúncias de intolerância, privacidade de endereços e protocolos de respeito.

### Objetivos Principais
- Permitir buscas intuitivas por localização, culto ou tipo de serviço/produto, com resultados em cards responsivos.
- Facilitar agendamentos rápidos (4-5 cliques, inspirado no Cal.com), com pagamentos, video calls (Jitsi Meet privado) e regras de cancelamento/reembolso.
- Suportar eventos com cronograma, recomendações e gerenciamento de participantes (incluindo listas de espera mista).
- Oferecer lojinha opcional para produtos espirituais (artesanato, acessórios), com carrinho, estoque e entregas manuais.
- Garantir notificações personalizadas (FCM com templates fixos + customização por casa), avaliações bidirecionais (estrelas públicas, comentários privados) e suporte a disputas (tickets com anexos).
- Promover sustentabilidade: Comissões de 10% para a plataforma, com foco em comunidades espirituais.

### Stack Técnica
- **Front-end**: React (v18) com Tailwind CSS (v3) para design responsivo e mobile-first, componentes reutilizáveis (ex.: Card, Button, Input).
- **Backend**: Firebase (Firestore para coleções, Authentication para login, Storage para fotos/anexos, Cloud Functions para lógica como reembolsos/notificações, FCM para push/email/SMS).
- **Integrações**:
  - Google Maps API: Buscas por região, geocodificação automática de `location` (lat/lng).
  - Google Calendar: Sincronização de slots disponíveis (definidos pelo dirigente).
  - Stripe: Checkout, pagamentos e reembolsos automáticos (comissão de 10%).
  - Jitsi Meet: Video calls privadas com senha (gratuito, links únicos).
  - Calendarific API: Cálculo de dias úteis para reembolsos (72h úteis: 100%; 24h: 50%; mesmo dia: 0%).
- **Autenticação**: Firebase Auth com JWT; restrição a detalhes logados.
- **Segurança**: Regras do Firestore para permissões (`owner`, `responsibles`, `userId`); validações (ex.: regex para contatos, limites de anexos).
- **Escopo Global**: Início no Brasil/América Latina, com suporte multilíngue (português, inglês, espanhol) e buscas por país. Moeda inicial: BRL (expansão futura).

## Funcionalidades Principais

1. **Área Logada**:
   - Login/Registro: Formulário com e-mail/senha (Firebase Auth), recuperação via e-mail, tipos de usuário (comum ou responsável).
   - Autenticação: JWT para sessões; redirecionamento para login em páginas protegidas.
   - Perfil de Usuário: Edição de dados; dashboard para responsáveis com agendamentos, eventos, produtos e relatórios básicos (pós-MVP).

2. **Gerenciamento de Casas de Rezo (CRUD)**:
   - Criação/Edição: Formulário para `name`, `leader` (name, photo, bio, contact), `phone`, `whatsapp`, endereço (`street`, `neighborhood`, etc.), `location` (auto-derivado), `cult`, `about`, `socialMedia`, `notificationTemplate`, `enabledShop` (lojinha opcional).
   - Visualização: Detalhes resumidos públicos, completos logados; upload de `logo`/`gallery` (Firebase Storage).
   - Gerenciamento: `owner` adiciona/remove `responsibles` (sem limite); verificação via `approved` com selo.
   - Exclusão: Soft delete (`deleted: true`) pelo `owner`.
   - Integração Cultural: Guias de protocolos, denúncias via tickets.

3. **Busca e Descoberta**:
   - Página Inicial (não logada): Busca por termo, culto, cidade/UF, tipo de atendimento/produto. Cards com nome, culto, imagem, rating médio.
   - Filtros: Culto (dropdown), localização (Google Maps), tipo (`atendimentos.type` ou `products.category`).
   - Perfil da Casa: Detalhes de `houses`, atendimentos, eventos, lojinha (se `enabledShop: true`), botão "Agendar/Comprar".

4. **Eventos**:
   - Criação/Edição: Pelo `owner`/`responsibles`, com `name`, `description`, `startDate`, `endDate`, `images` (até 7), `value`, `contact` (validado), `houseId`, `responsibles`, `vacancies` (1-100).
   - Subcoleções: `schedule` (até 10 atividades), `recommendations` (até 3, sugeridas de `house_recommendations`).
   - Participantes: `rsvps` com gerenciamento misto de waitlist (botões simples + auto-movimento via Cloud Function).
   - Fluxo: Cadastro com sugestões de recomendações; dashboard com botões para confirmar/mover waitlist.

5. **Atendimentos**:
   - Criação/Edição: Pelo `owner`/`responsibles`, com `name`, `type`, `description`, `modality`, `requiresLocation`, `packages` (name, value, details, duration - null para sessões variáveis).
   - Agendamento: Atendimento > pacote > slot/"Primeiro Horário Disponível" (Google Calendar) > resumo (regras de cancelamento) > Stripe > `bookings` (`pending`).
   - Confirmação: 24h prazo, com lembretes FCM (12h/24h); auto-cancelamento se não confirmado.
   - Reagendamento: Proposta pelo dirigente, aceitação via FCM.
   - Cancelamento: Botão simples, reembolso automático (72h úteis: 100%; 24h: 50%; mesmo dia: 0%) via Calendarific.
   - Início: Botão abre Jitsi privada com senha (online) ou Google Maps (presencial).
   - Pós: FCM para avaliação (`reviews`); ticket para problemas (`tickets` com anexos).

6. **Lojinha da Casa**:
   - Habilitação: Toggle `enabledShop: true` pelo `owner`.
   - Gerenciamento: CRUD de produtos (`name`, `description`, `images` (até 5), `price`, `stock`, `category`, `houseId`, `approved`).
   - Busca: Integrada à busca geral (ex.: "cachimbos xamânicos"), cards com produto, preço, botão "Adicionar ao Carrinho".
   - Carrinho: `carts` temporário (userId, items, totalValue), expira em 24h.
   - Checkout: Endereço de entrega > Stripe (total - 10% comissão) > salva em `orders` (`pending`), decrementa stock.
   - Gerenciamento de Pedidos: Dashboard com botões "Confirmar Pagamento", "Enviar", "Concluir"; reembolsos via WhatsApp.
   - Pós-Compra: FCM para avaliação (integra com `reviews`); ticket para problemas.

7. **Notificações**:
   - Via FCM, templates fixos + `notificationTemplate` (ex.: "Seu pedido foi confirmado! [template]").
   - Para agendamentos/eventos: Confirmação (12h/24h), lembretes 24h antes, status.
   - Para lojinha: Novos pedidos, atualizações de status.
   - Prioridade a WhatsApp via `whatsapp`.

8. **Extras**:
   - Avaliações: Bidirecionais em `reviews` (estrelas 1-5 públicas, comentários privados).
   - Tickets: Para disputas, com `type` (categorias), descrição, anexos (máx. 3, 5MB).
   - Verificação Cultural: Selos para `approved`, denúncias via tickets.
   - Monetização: Comissão de 10% em agendamentos/vendas via Stripe.

## Esquema JSON para Todas as Coleções

### 1. Coleção: `houses`
- **Descrição**: Casas de rezo com feature flag para lojinha.
- **Campos**:
  ```json
  {
    "logo": String, // URL no Firebase Storage (opcional)
    "gallery": Array<String>, // Até 5 URLs (opcional)
    "name": String, // ex.: "Cruzeiro Encantado"
    "leader": {
      "name": String,
      "photo": String, // URL (opcional)
      "bio": String, // máx. 500 caracteres
      "contact": String // e-mail
    },
    "phone": String,
    "whatsapp": String, // opcional
    "accessibility": String, // opcional
    "street": String,
    "neighborhood": String,
    "number": String,
    "complement": String, // opcional
    "zipCode": String,
    "city": String,
    "state": String,
    "location": { "lat": Number, "lng": Number }, // Via Google Maps API
    "about": String, // máx. 1000 caracteres
    "socialMedia": { "facebook": String, "instagram": String }, // opcional
    "cult": String, // ex.: "Umbanda"
    "owner": String, // UID do criador
    "approved": Boolean, // padrão: false
    "deleted": Boolean, // padrão: false
    "responsibles": Array<String>, // UIDs dos responsáveis
    "notificationTemplate": String, // opcional
    "enabledShop": Boolean // padrão: false
  }
  ```

### 2. Coleção: `house_recommendations`
- **Descrição**: Recomendações gerais da casa.
- **Campos**:
  ```json
  {
    "recommendation": String, // ex.: "Wear White Clothes"
    "description": String, // máx. 300 caracteres
    "type": String // texto livre, ex.: "clothing"
  }
  ```

### 3. Coleção: `events`
- **Descrição**: Eventos da casa.
- **Campos**:
  ```json
  {
    "name": String, // ex.: "Ayahuasca Ritual"
    "description": String, // máx. 500 caracteres
    "startDate": Timestamp, // ISO
    "endDate": Timestamp, // ISO
    "images": Array<String>, // Até 7 URLs (opcional)
    "value": Number, // ex.: 100.00 (BRL)
    "contact": {
      "email": String, // regex validado
      "phone": String, // regex validado
      "whatsapp": String // regex validado, coincide com houses.whatsapp
    },
    "houseId": String, // ex.: "house123"
    "responsibles": Array<String>, // UIDs
    "vacancies": Number // 1-100
  }
  ```

### 4. Subcoleção: `schedule`
- **Descrição**: Cronograma de eventos (até 10).
- **Campos**:
  ```json
  {
    "activity": String, // ex.: "Opening Ceremony"
    "description": String, // máx. 300 caracteres
    "startDate": Timestamp, // ISO
    "endDate": Timestamp, // ISO
    "eventId": String, // ex.: "event456"
    "responsible": String // UID (opcional)
  }
  ```

### 5. Subcoleção: `recommendations`
- **Descrição**: Recomendações de eventos (até 3).
- **Campos**:
  ```json
  {
    "recommendation": String, // ex.: "Wear White Clothes"
    "description": String, // máx. 300 caracteres
    "eventId": String, // ex.: "event456"
    "type": String // texto livre
  }
  ```

### 6. Subcoleção: `rsvps`
- **Descrição**: Participantes de eventos.
- **Campos**:
  ```json
  {
    "eventId": String, // ex.: "event456"
    "status": String, // "pending", "confirmed", "canceled", "waitlisted"
    "userId": String,
    "valuePaid": Number, // ex.: 100.00 (BRL)
    "refunded": Boolean // padrão: false
  }
  ```

### 7. Coleção: `atendimentos`
- **Descrição**: Atendimentos da casa.
- **Campos**:
  ```json
  {
    "name": String, // ex.: "Jogo de Tarot"
    "type": String, // ex.: "tarot"
    "description": String, // máx. 500 caracteres
    "modality": String, // "online", "in-person", "both"
    "requiresLocation": Boolean, // true para presencial
    "packages": Array<Object>, // ex.: name, value, details, duration
    "houseId": String // ex.: "house123"
  }
  ```

### 8. Coleção: `bookings`
- **Descrição**: Agendamentos de atendimentos.
- **Campos**:
  ```json
  {
    "userId": String,
    "atendimentoId": String, // ex.: "atendimento789"
    "packageName": String, // ex.: "10 Perguntas"
    "date": Timestamp, // ISO
    "originalDate": Timestamp, // opcional
    "status": String, // "pending", "confirmed", "canceled", "completed", "rescheduled"
    "paymentId": String,
    "value": Number, // ex.: 50.00 (BRL)
    "refunded": Boolean, // padrão: false
    "videoLink": String, // ex.: "https://meet.jit.si/booking-abc123"
    "videoLinkPassword": String, // ex.: "xyz789"
    "houseId": String // ex.: "house123"
  }
  ```

### 9. Coleção: `reviews`
- **Descrição**: Avaliações de atendimentos/produtos.
- **Campos**:
  ```json
  {
    "bookingId": String, // ou orderId para lojinha
    "fromUserId": String,
    "toUserId": String,
    "rating": Number, // 1-5
    "comment": String, // máx. 500 caracteres, privado
    "date": Timestamp // ISO
  }
  ```

### 10. Coleção: `tickets`
- **Descrição**: Tickets para problemas.
- **Campos**:
  ```json
  {
    "bookingId": String, // ou orderId
    "userId": String,
    "type": String, // "atraso", "qualidade baixa", "não comparecimento", "outro"
    "description": String, // máx. 1000 caracteres
    "attachments": Array<String>, // máx. 3, 5MB cada
    "status": String, // "open", "in-review", "resolved"
    "resolution": String, // opcional
    "date": Timestamp, // ISO
    "houseId": String // ex.: "house123"
  }
  ```

### 11. Subcoleção: `products`
- **Caminho**: `firestore.collection('houses').doc(houseId).collection('products')`
- **Descrição**: Produtos da lojinha.

```json
{
  "name": String, // ex.: "Cachimbo Xamânico"
  "description": String, // máx. 1000 caracteres
  "images": Array<String>, // Até 5 URLs
  "price": Number, // ex.: 150.00 (BRL)
  "stock": Number, // ex.: 10
  "category": String, // ex.: "acessórios xamânicos"
  "houseId": String, // ex.: "house123"
  "approved": Boolean, // padrão: false
  "deleted": Boolean // padrão: false
}
```

### 12. Coleção: `carts`
- **Caminho**: `firestore.collection('carts')`
- **Descrição**: Carrinhos temporários (expira em 24h).

```json
{
  "userId": String,
  "items": Array<Object>, // {productId: String, quantity: Number, houseId: String}
  "totalValue": Number, // ex.: 300.00 (BRL)
  "createdAt": Timestamp, // ISO
  "updatedAt": Timestamp // ISO
}
```

### 13. Coleção: `orders`
- **Caminho**: `firestore.collection('orders')`
- **Descrição**: Pedidos da lojinha.

```json
{
  "userId": String,
  "houseId": String, // ex.: "house123"
  "items": Array<Object>, // {productId: String, quantity: Number, price: Number}
  "totalValue": Number, // ex.: 300.00 (BRL)
  "commissionValue": Number, // 10% (ex.: 30.00)
  "paymentId": String, // ex.: "pi_123456789_stripe"
  "status": String, // "pending", "paid", "shipped", "delivered", "canceled"
  "shippingAddress": {
    "street": String,
    "city": String,
    "state": String,
    "zipCode": String
  },
  "createdAt": Timestamp, // ISO
  "refunded": Boolean // padrão: false
}
```

## Regras de Segurança do Firestore (Completa)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /houses/{houseId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.approved == false;
      allow update: if request.auth.uid == resource.data.owner || request.auth.uid in resource.data.responsibles;
      allow delete: if request.auth.uid == resource.data.owner;
      // Apenas owner gerencia responsibles e enabledShop
      allow update: if request.auth.uid == resource.data.owner || 
                     (request.auth.uid in resource.data.responsibles && 
                      request.resource.data.responsibles == resource.data.responsibles &&
                      request.resource.data.enabledShop == resource.data.enabledShop);
      match /atendimentos/{atendimentoId} {
        allow read: if request.auth != null;
        allow write: if request.auth.uid == resource.data.owner || request.auth.uid in resource.data.responsibles;
        allow create, update: if request.resource.data.packages.size() > 0;
      }
      match /bookings/{bookingId} {
        allow read: if request.auth != null;
        allow create: if request.auth != null;
        allow update: if request.auth.uid == resource.data.userId || 
                       request.auth.uid == resource.data.owner || 
                       request.auth.uid in resource.data.responsibles;
        allow create, update: if request.resource.data.status in ['pending', 'confirmed', 'canceled', 'completed', 'rescheduled'];
      }
      match /reviews/{reviewId} {
        allow read: if request.auth != null && (request.auth.uid == resource.data.fromUserId || 
                                               request.auth.uid == resource.data.toUserId);
        allow create: if request.auth.uid == resource.data.fromUserId;
      }
      match /house_recommendations/{recommendationId} {
        allow read: if request.auth != null;
        allow write: if request.auth.uid == resource.data.owner || request.auth.uid in resource.data.responsibles;
      }
      match /events/{eventId} {
        allow read: if request.auth != null;
        allow write: if request.auth.uid == resource.data.owner || request.auth.uid in resource.data.responsibles;
        allow create, update: if request.resource.data.contact.email is string || 
                              request.resource.data.contact.phone is string || 
                              request.resource.data.contact.whatsapp is string;
        allow create, update: if request.resource.data.vacancies >= 1 && request.resource.data.vacancies <= 100;
        allow create, update: if request.resource.data.contact.whatsapp == get(/databases/$(database)/documents/houses/$(houseId)).data.whatsapp || 
                                request.resource.data.contact.whatsapp is string;
        match /schedule/{scheduleId} {
          allow read: if request.auth != null;
          allow write: if request.auth.uid == resource.data.owner || request.auth.uid in resource.data.responsibles;
          allow create: if get(/databases/$(database)/documents/houses/$(houseId)/events/$(eventId)/schedule).size() < 10;
        }
        match /schedule/{scheduleId} {
          allow read: if request.auth != null;
          allow write: if request.auth.uid == resource.data.owner || request.auth.uid in resource.data.responsibles;
          allow create: if get(/databases/$(database)/documents/houses/$(houseId)/events/$(eventId)/schedule).size() < 10;
        }
        match /recommendations/{recommendationId} {
          allow read: if request.auth != null;
          allow write: if request.auth.uid == resource.data.owner || request.auth.uid in resource.data.responsibles;
          allow create: if get(/databases/$(database)/documents/houses/$(houseId)/events/$(eventId)/recommendations).size() < 3;
        }
      }
      match /rsvps/{rsvpId} {
        allow read: if request.auth != null;
        allow create: if request.auth != null;
        allow update: if request.auth.uid == resource.data.userId || 
                       request.auth.uid == resource.data.owner || 
                       request.auth.uid in resource.data.responsibles;
        allow create, update: if request.resource.data.status in ['pending', 'confirmed', 'canceled', 'waitlisted'];
      }
      match /products/{productId} {
        allow read: if request.auth != null && get(/databases/$(database)/documents/houses/$(houseId)).data.enabledShop == true;
        allow write: if request.auth.uid == resource.data.owner || request.auth.uid in resource.data.responsibles;
        allow create, update: if request.resource.data.images.size() <= 5 && request.resource.data.approved == false;
      }
      match /carts/{cartId} {
        allow read, write: if request.auth.uid == resource.data.userId;
      }
    }
    match /orders/{orderId} {
      allow read: if request.auth.uid == resource.data.userId || 
                   request.auth.uid == get(/databases/$(database)/documents/houses/$(resource.data.houseId)).data.owner || 
                   request.auth.uid in get(/databases/$(database)/documents/houses/$(resource.data.houseId)).data.responsibles;
      allow create: if request.auth.uid == resource.data.userId;
      allow update: if request.auth.uid == resource.data.userId || 
                    request.auth.uid == get(/databases/$(database)/documents/houses/$(resource.data.houseId)).data.owner || 
                    request.auth.uid in get(/databases/$(database)/documents/houses/$(resource.data.houseId)).data.responsibles;
      allow create, update: if request.resource.data.status in ['pending', 'paid', 'shipped', 'delivered', 'canceled'];
    }
    match /tickets/{ticketId} {
      allow read: if request.auth.uid == resource.data.userId || 
                   request.auth.uid in get(/databases/$(database)/documents/houses/$(resource.data.houseId)).data.responsibles;
      allow create: if request.auth != null;
      allow update: if request.auth.uid == resource.data.userId || 
                    request.auth.uid in get(/databases/$(database)/documents/houses/$(resource.data.houseId)).data.responsibles;
      allow create, update: if request.resource.data.status in ['open', 'in-review', 'resolved'];
      allow create, update: if request.resource.data.attachments.size() <= 3;
    }
  }
}
```

### Roadmap para Implementação
- Backend: Configurar Firestore, regras, Cloud Functions.
- Integrações: Google Maps/Calendar, Stripe, Jitsi, FCM, Calendarific.
- Frontend: Busca, perfil, agendamento, dashboard, lojinha, avaliação, tickets.
- Testes: Agendamento, pagamento, video call, notificações.
# rezo-web
