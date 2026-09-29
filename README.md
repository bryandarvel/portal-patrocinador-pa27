<div align="center">

# 🌍 Portal do Patrocinador - Planeta Atlântida 🎸
### Desafio GC 2026 | Trilhas Java & IA e Dados

[![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.java.com/)
[![IA & Dados](https://img.shields.io/badge/IA_%26_Dados-FF6F00?style=for-the-badge&logo=databricks&logoColor=white)]()
[![RBS](https://img.shields.io/badge/RBS-Grupo_RBS-005C9E?style=for-the-badge)]()
[![Geração Caldeira](https://img.shields.io/badge/Geração_Caldeira-Desafio_2026-8A2BE2?style=for-the-badge)]()

*"Mais autonomia, transparência e agilidade para os patrocinadores. Menos trabalho manual para o time B2B."*

</div>

---

## 📖 Sobre o Projeto

O **Planeta Atlântida** é o maior festival de música do Sul do Brasil e completa **30 anos em 2026**. Com um público de **80 mil planetários** e **39 marcas patrocinadoras**, o time de Planejamento B2B da RBS enfrenta um grande desafio: gerenciar todas as informações dessas parcerias de forma centralizada.

Atualmente, os dados ficam espalhados em **e-mail, SharePoint, Teams e WhatsApp**, gerando retrabalho e demora no atendimento. 

O objetivo deste projeto é construir o **Portal do Patrocinador**, uma área online restrita e segura onde cada marca encontra tudo sobre sua parceria em um só lugar, desde o fechamento do contrato até o pós-evento.

---

## 🚨 O Problema (A Dor)

> [!WARNING]
> **Informação Espalhada:** Dados circulam por 4+ ferramentas diferentes.
> **Trabalho Manual:** O time gasta horas juntando dados de planilhas.
> **Sem Relatórios Automáticos:** Dificuldade em extrair históricos da parceria.
> **Perguntas Repetidas:** Patrocinadores dependem de e-mails para dúvidas simples.

---

## 💡 A Solução

<div align="center">
  <h3>Um portal online, restrito e personalizado.</h3>
</div>

O portal contará com **dois tipos de acesso**:
1. 🛡️ **Admin RBS:** Alimenta e gerencia o portal.
2. 🏢 **Admin Patrocinador:** Acesso para clientes e agências.

**O que o portal vai resolver:**
*   ✅ Centralizar documentos, status de entregas, mídia, cortesias e credenciamento.
*   ✅ Automatizar relatórios e indicadores de resultados parciais.
*   ✅ Disponibilizar um FAQ integrado e histórico organizado.
*   ✅ Dar autonomia total ao patrocinador com um menu baseado no plano comercial comprado (7 abas).

---

## 🛠️ Arquitetura e Tecnologias

O projeto é dividido em duas trilhas principais que se integram para formar a solução completa.

### ☕ Trilha Java (Back-end)
| Prioridade | Funcionalidade |
| :---: | :--- |
| 🔴 **Essencial** | Back-end do portal (API Rest) |
| 🔴 **Essencial** | Login individual e cadastro de e-mails liberados |
| 🔴 **Essencial** | Controle de permissões (Admin RBS vs. Admin Patrocinador) |
| 🔴 **Essencial** | Upload e download de arquivos |
| 🔴 **Essencial** | Histórico de atualizações e regras por nível de cota (Master, G, Subcota) |

### 🧠 Trilha IA & Dados
| Prioridade | Funcionalidade |
| :---: | :--- |
| 🟡 **Importante** | Organização (modelagem) dos dados dos patrocinadores |
| 🔴 **Essencial** | Extração de relatórios pelo portal e juntada de mídia/comprovações |
| 🟡 **Importante** | Automatização de alertas (prazos, atualizações, preenchimento) |
| 🟡 **Importante** | Integração com ferramentas da RBS (SharePoint e Outlook) |
| 🟢 **Desejável** | FAQ integrado com manual de operações |

### 🤝 Construído em Conjunto
*   🔴 **Essencial:** Banco de dados e Menu com as 7 abas do portal.
*   🟡 **Importante:** Integração entre as partes do sistema.
*   🟢 **Desejável:** Telas seguindo a identidade visual do Planeta Atlântida (cores, fontes, elementos e logo).

---

## 🏆 Critérios de Sucesso

Para considerarmos o projeto um sucesso, a entrega deve atender aos seguintes pilares:

<div align="center">

| 🟢 Funcionalidade | 🟡 Usabilidade | 🔵 Performance | 🟣 Impacto |
| :---: | :---: | :---: | :---: |
| O portal precisa funcionar de verdade: login, permissões, upload, download e histórico. | Clientes e agências precisam navegar sozinhos, seguindo o plano comercial. | Relatórios sem trabalho manual e dados centralizados no portal. | Redução de trocas de mensagens e histórico organizado para o time B2B. |

</div>

---

## 📚 Glossário Rápido (Contexto Planeta Atlântida)

<details>
<summary><b>Clique aqui para expandir e entender os termos do projeto</b> 👇</summary>

*   **Patrocinador:** Marca que paga para aparecer e fazer ações no festival.
*   **Ativação de Marca:** Ação que a marca faz no evento para interagir com o público.
*   **Cota de Patrocínio:** O "pacote" comprado (Master, Subcota G ou Subcota).
*   **Cortesias:** Ingressos gratuitos que a marca recebe (passaporte, sexta ou sábado).
*   **Plano Comercial:** Documento com tudo o que o patrocinador comprou e vai receber.
*   **Credenciamento:** Cadastro das pessoas que vão trabalhar no evento.
*   **B2B:** Relação da RBS com as marcas (Business to Business).
*   **Open Staff:** Sistema oficial de credenciamento usado pelo evento.
*   **Veiculação:** Publicação de anúncio ou conteúdo (TV, rádio, redes sociais).
*   **Planetários:** Nome dado ao público do Planeta Atlântida.

</details>

---

<div align="center">

### 🚀 Desenvolvido para o Desafio GC 2026
**Trilhas Java e IA & Dados**

*"O maior festival de música do Sul do Brasil merece a melhor gestão de parcerias."*

</div>
