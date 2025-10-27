

# MeuEcommerceApp (FIAP - CheckPoint 5)

## 📲 Download do APK

O arquivo `.apk` compilado para instalação direta em dispositivos Android pode ser baixado no link abaixo:

[Link do APK](https://expo.dev/accounts/m3rl1m/projects/MeuEcommerceApp/builds/08a753c2-414c-417b-b1b3-50c6a9c020c6)

-----

## 📖 Descrição do Projeto

Este é um projeto acadêmico desenvolvido como parte da avaliação **CheckPoint 5** da FIAP.

**Importante:** Este **não** é um aplicativo de e-commerce funcional e completo, mas sim um protótipo simplificado. O objetivo principal do projeto é demonstrar a aplicação prática e a integração de conceitos avançados de desenvolvimento mobile utilizando React Native com Expo e Firebase.

O foco foi construir uma arquitetura que implementasse todos os requisitos obrigatórios da atividade, servindo como uma fundação que poderia ser expandida para um aplicativo comercial.

## ✅ Requisitos Cumpridos (Checklist)

O projeto implementa todos os 5 requisitos obrigatórios da atividade:

  * **[X] e) Autenticação com Firebase (e-mail/senha) (30 pontos)**

      * Telas de Login (`LoginScreen.tsx`) e Cadastro (`SignupScreen.tsx`).
      * Gerenciamento de estado de autenticação com persistência local (`AppNavigator.tsx` e `firebaseConfig.ts`).

  * **[X] d) Uso do Firestore para armazenagem de dados (20 pontos)**

      * **Produtos:** Carregamento de produtos da coleção `products` (`ProductListScreen.tsx`).
      * **Pedidos:** Criação de pedidos na coleção `orders` (`CartScreen.tsx`) e listagem na tela de pedidos (`TransactionScreen.tsx`).
      * **Lista de Desejos:** Gerenciamento em tempo real (realtime) da lista de desejos na coleção `wishlists` (`WishlistContext.tsx`).
      * **Avaliações (Reviews):** Leitura de avaliações da coleção `reviews` na tela de detalhes do produto (`ProductDetailScreen.tsx`).

  * **[X] c) Notificação Push Local (20 pontos)**

      * Configuração do `expo-notifications` em `notificationService.ts`.
      * Botão de teste na tela de Notificações (`NotificationScreen.tsx`).
      * Notificação local disparada ao finalizar um pedido (`CartScreen.tsx`).
      * Persistência e listagem de notificações recebidas na tela `NotificationScreen.tsx`.

  * **[X] a) Tema Claro e Tema Escuro (15 pontos)**

      * Gerenciamento de tema via React Context (`ThemeContext.tsx`).
      * Definições de cores em `src/theme/colors.ts`.
      * Interruptor (Switch) funcional na tela de Perfil para alternar o tema (`ProfileScreen.tsx`).

  * **[X] b) Internacionalização (PT-EN) (15 pontos)**

      * Configuração do `i18next` em `src/services/i18n.ts`.
      * Arquivos de tradução `pt.json` e `en.json` em `src/locales/`.
      * Funcionalidade de troca de idioma na tela de Perfil (`ProfileScreen.tsx`).
      * Todas as telas e componentes visíveis ao usuário utilizam o sistema de tradução.

-----

## ✨ Funcionalidades Adicionais (Além do Mínimo)

Para tornar o protótipo mais robusto, várias funcionalidades de e-commerce foram implementadas:

  * 🛒 **Carrinho de Compras:** Gerenciamento completo de estado do carrinho (adicionar, remover, incrementar/decrementar) via Context API.
  * 🛍️ **Seleção de Variações:** Suporte para variações de produtos (ex: cor, tamanho) com preços dinâmicos.
  * 🧾 **Criação de Pedidos (Simulado):** Ao "Finalizar Compra", o carrinho é salvo como um novo pedido no Firestore com status "Pendente".
  * ❤️ **Lista de Desejos (Wishlist):** Sincronizada em tempo real com o Firestore.
  * 🔍 **Busca de Produtos:** Filtragem de produtos por nome, categoria ou marca na tela inicial.
  * 👤 **Perfil Avançado:** Além de Logout, Tema e Idioma, o usuário pode:
      * Alterar sua foto de perfil (salva localmente no dispositivo via `AsyncStorage`).
      * Atualizar sua senha do Firebase Auth com reautenticação de segurança.

## 🛠️ Tecnologias Utilizadas

  * **React Native (Expo)**
  * **TypeScript**
  * **Firebase v9+ (SDK Modular)**
      * Firebase Authentication
      * Firestore Database
  * **React Navigation v6**
      * Native Stack Navigator
      * Bottom Tab Navigator
  * **React Context API** (para gerenciamento de estado global de Tema, Carrinho e Lista de Desejos)
  * **i18next** (para internacionalização)
  * **Expo Notifications** (para notificações locais)
  * **Expo Image Picker** (para seleção de foto de perfil)
  * **UUID** (para IDs únicos de itens no carrinho)

## 🚀 Como Rodar o Projeto

### 1\. Pré-requisitos

  * Node.js (LTS)
  * Conta no Firebase
  * Expo Go (no celular) ou Emulador Android/iOS

### 2\. Configuração do Firebase

Este projeto depende de um projeto Firebase configurado.

1.  **Criar Projeto:** Crie um novo projeto no [Console do Firebase](https://console.firebase.google.com/).
2.  **Configuração do App:** Crie um aplicativo Web (ícone `</>`) dentro do seu projeto.
3.  **Copiar Config:** Copie o objeto `firebaseConfig` (com `apiKey`, `authDomain`, etc.) e cole-o no arquivo `src/firebase/firebaseConfig.ts`.
4.  **Habilitar Serviços:**
      * No Console do Firebase, habilite o **Authentication** (e ative o provedor E-mail/Senha).
      * Habilite o **Firestore Database** (inicie em modo de Produção).
5.  **Regras de Segurança (Obrigatório):**
      * Vá para **Firestore Database \> Regras**.
      * Substitua as regras padrão por estas:
        ```js
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {

            match /products/{productId} {
              allow read: if true;
              allow write: if false; 
            }

            match /reviews/{reviewId} {
              allow read: if true;
              allow create: if request.auth != null; 
            }

            match /wishlists/{userId} {
              allow read, write: if request.auth != null && request.auth.uid == userId;
            }

            match /orders/{orderId} {
              allow read: if request.auth != null && request.auth.uid == resource.data.userId;
              allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
              allow update, delete: if false;
            }
          }
        }
        ```
      * Clique em **Publicar**.
6.  **Índices do Firestore (Obrigatório):**
      * Vá para **Firestore Database \> Índices** e crie os dois índices compostos a seguir:
      * **Índice 1 (Pedidos):**
          * **Coleção:** `orders`
          * **Campos:** `userId` (Crescente) E `createdAt` (Descendente)
          * **Escopo:** Coleta
      * **Índice 2 (Avaliações):**
          * **Coleção:** `reviews`
          * **Campos:** `productId` (Crescente) E `createdAt` (Descendente)
          * **Escopo:** Coleta
      * *Aguarde os índices serem "Ativados" (pode levar alguns minutos).*
7.  **Popular Dados (Obrigatório):**
      * O app não funcionará sem dados. Adicione manualmente alguns documentos à sua coleção `products` e `reviews` no Firestore para poder testar as funcionalidades de listagem, detalhes, carrinho e lista de desejos.
