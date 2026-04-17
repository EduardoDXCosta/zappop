begin;

-- ═══════════════════════════════════════════════════════════════
-- PIZZARIA
-- ═══════════════════════════════════════════════════════════════
insert into global_products (name, description, category) values
('Pizza Calabresa', 'Molho, mussarela, calabresa e cebola', 'Pizza'),
('Pizza Mussarela', 'Molho e mussarela', 'Pizza'),
('Pizza Portuguesa', 'Molho, mussarela, presunto, ovos, cebola e azeitonas', 'Pizza'),
('Pizza Frango c/ Catupiry', 'Molho, frango desfiado e catupiry', 'Pizza'),
('Pizza Quatro Queijos', 'Molho, mussarela, provolone, catupiry e parmesão', 'Pizza'),
('Pizza Pepperoni', 'Molho, mussarela e pepperoni', 'Pizza'),
('Pizza Margherita', 'Molho, mussarela de búfala, tomate e manjericão', 'Pizza'),
('Pizza Bacon', 'Molho, mussarela e bacon crocante', 'Pizza'),
('Pizza Toscana', 'Molho, mussarela, calabresa moída e cebola', 'Pizza'),
('Pizza Atum', 'Molho, mussarela e atum', 'Pizza'),
('Pizza Lombinho', 'Molho, mussarela e lombo canadense', 'Pizza'),
('Pizza Palmito', 'Molho, mussarela e palmito', 'Pizza'),
('Pizza Portuguesa Especial', 'Molho, mussarela, presunto, ovos, cebola, azeitonas e orégano', 'Pizza'),
('Pizza Camarão', 'Molho, mussarela e camarão', 'Pizza'),
(' Pizza Cinco Queijos', 'Molho, mussarela, gorgonzola, catupiry, provolone e parmesão', 'Pizza'),
('Pizza Vegetariana', 'Molho, mussarela, brócolis, tomate, cebola, pimentão e champignon', 'Pizza'),
('Pizza Doce Chocolate', 'Chocolate ao leite com granulado', 'Pizza'),
('Pizza Doce Chocolate c/ Morango', 'Chocolate com morango', 'Pizza'),
('Pizza Doce Banana Canela', 'Banana com canela e açúcar', 'Pizza'),
('Pizza Doce Romeu e Julieta', 'Goiabada com queijo minas', 'Pizza'),
('Pizza Doce Confete', 'Chocolate, confetes e leite condensado', 'Pizza'),
('Borda Recheada Catupiry', 'Borda extra recheada com catupiry', 'Pizza'),
('Borda Recheada Cheddar', 'Borda extra recheada com cheddar', 'Pizza'),
('Borda Recheada Chocolate', 'Borda extra recheada com chocolate', 'Pizza'),

-- ═══════════════════════════════════════════════════════════════
-- AÇAÍ / SORVETE
-- ═══════════════════════════════════════════════════════════════
('Açaí 300ml', 'Açaí puro com banana e granola', 'Açaí'),
('Açaí 500ml', 'Açaí com banana, granola, leite condensado e morango', 'Açaí'),
('Açaí 700ml', 'Açaí com banana, granola, leite condensado, morango e kiwi', 'Açaí'),
('Açaí no Copo 400ml', 'Açaí cremoso no copo com colher', 'Açaí'),
('Açaí Premium 500ml', 'Açaí com frutas, leite em pó, leite condensado, granola e mel', 'Açaí'),
('Açaí com Nutella 500ml', 'Açaí com Nutella, morango e granola', 'Açaí'),
('Açaí Proteico 500ml', 'Açaí com whey protein, banana, aveia e mel', 'Açaí'),
('Açaí Bowl 400ml', 'Açaí thick bowl com frutas frescas e granola', 'Açaí'),
('Açaí Kids 250ml', 'Açaí com chocolate e confetes', 'Açaí'),
('Milk-Shake Açaí 400ml', 'Milk-shake cremoso de açaí', 'Açaí'),
('Sorvete Casquinha', 'Casquinha com 1 bola de sorvete', 'Açaí'),
('Sorvete Casquinha Dupla', 'Casquinha com 2 bolas de sorvete', 'Açaí'),
('Sorvete Copinho 2 Bolas', 'Copinho com 2 bolas de sorvete', 'Açaí'),
('Sorvete Copinho 3 Bolas', 'Copinho com 3 bolas de sorvete', 'Açaí'),
('Sorvete Picolé Limão', 'Picolé de limão', 'Açaí'),
('Sorvete Picolé Morango', 'Picolé de morango', 'Açaí'),
('Sorvete Picolé Chocolate', 'Picolé de chocolate', 'Açaí'),
('Sorvete Picolé Coco', 'Picolé de coco', 'Açaí'),
('Banana Split', '3 bolas de sorvete com banana, calda e chantilly', 'Açaí'),
('Sundae Caramelo', 'Sorvete com calda de caramelo e chantilly', 'Açaí'),

-- ═══════════════════════════════════════════════════════════════
-- JAPONESA / SUSHI
-- ═══════════════════════════════════════════════════════════════
('Combo Sushi 20 Peças', '20 peças variadas de sushi e sashimi', 'Japonesa'),
('Combo Sushi 30 Peças', '30 peças variadas de sushi e sashimi', 'Japonesa'),
('Combo Sushi 50 Peças', '50 peças variadas de sushi, sashimi e temaki', 'Japonesa'),
('Temaki Salmão', 'Temaki de salmão com cream cheese', 'Japonesa'),
('Temaki Camarão', 'Temaki de camarão com cream cheese', 'Japonesa'),
('Temaki Atum', 'Temaki de atum', 'Japonesa'),
('Temaki Frango', 'Temaki de frango com cream cheese', 'Japonesa'),
('Temaki Califórnia', 'Temaki de kani, pepino e cream cheese', 'Japonesa'),
('Hot Roll Salmão 10 Peças', 'Hot roll de salmão com cream cheese (10 unidades)', 'Japonesa'),
('Hot Roll Camarão 10 Peças', 'Hot roll de camarão (10 unidades)', 'Japonesa'),
('Hot Roll Califórnia 10 Peças', 'Hot roll de kani e cream cheese (10 unidades)', 'Japonesa'),
('Sashimi Salmão 10 Peças', '10 fatias de salmão cru', 'Japonesa'),
('Sashimi Atum 10 Peças', '10 fatias de atum cru', 'Japonesa'),
('Niguiri Salmão 2 Peças', '2 niguiri de salmão', 'Japonesa'),
('Niguiri Atum 2 Peças', '2 niguiri de atum', 'Japonesa'),
('Niguiri Camarão 2 Peças', '2 niguiri de camarão', 'Japonesa'),
('Uramaki Salmão 8 Peças', 'Uramaki de salmão (8 peças)', 'Japonesa'),
('Uramaki Califórnia 8 Peças', 'Uramaki de kani e pepino (8 peças)', 'Japonesa'),
('Uramaki Philadelphia 8 Peças', 'Uramaki de salmão e cream cheese (8 peças)', 'Japonesa'),
('Sunomono', 'Salada de pepino com gergelim e vinagre', 'Japonesa'),
('Missoshiru', 'Sopa de missô com tofu e cebolinha', 'Japonesa'),
('Harumaki 4 Peças', 'Rolinhos primavera crocantes (4 unidades)', 'Japonesa'),
('Gyosa 6 Peças', 'Pastel japonês de carne (6 unidades)', 'Japonesa'),
('Yakisoba', 'Macarrão japonês com legumes, carne e molho', 'Japonesa'),
('Ebi Fry 6 Peças', 'Camarão empanado frito (6 unidades)', 'Japonesa'),
('Churros Japoneses 4 Peças', 'Churros recheados com doce de leite (4 unidades)', 'Japonesa'),

-- ═══════════════════════════════════════════════════════════════
-- MARMITA / REFEIÇÃO
-- ═══════════════════════════════════════════════════════════════
('Marmita Pequena', 'Arroz, feijão, 1 proteína e 2 acompanhamentos', 'Marmita'),
('Marmita Média', 'Arroz, feijão, 2 proteínas e 3 acompanhamentos', 'Marmita'),
('Marmita Grande', 'Arroz, feijão, 2 proteínas e 4 acompanhamentos', 'Marmita'),
('Marmita Fitness Frango', 'Arroz integral, frango grelhado e legumes', 'Marmita'),
('Marmita Fitness Carne', 'Arroz integral, carne grelhada e salada', 'Marmita'),
('Marmita Fitness Peixe', 'Arroz integral, peixe grelhado e legumes', 'Marmita'),
('Marmita Vegetariana', 'Arroz, feijão, omelete e legumes grelhados', 'Marmita'),
('Marmita Vegana', 'Arroz integral, feijão, abobora e couve', 'Marmita'),
('Prato Feito Frango', 'Frango à milanesa com arroz, feijão e batata frita', 'Marmita'),
('Prato Feito Carne', 'Bife acebolado com arroz, feijão e batata frita', 'Marmita'),
('Prato Feito Peixe', 'Filé de peixe com arroz, feijão e salada', 'Marmita'),
('Prato Feito Strogonoff', 'Strogonoff de frango com arroz e batata palha', 'Marmita'),
('Prato Feito Bife à Parmegiana', 'Bife à parmegiana com arroz e fritas', 'Marmita'),
('Prato Feito Frango Grelhado', 'Frango grelhado com arroz, legumes e salada', 'Marmita'),
('Prato Feito Omelete', 'Omelete com queijo, presunto e salada', 'Marmita'),
('Bowl Fitness Frango', 'Bowl com arroz integral, frango, abacate e molho', 'Marmita'),
('Bowl Fitness Salmão', 'Bowl com arroz integral, salmão, edamame e molho', 'Marmita'),
('Wrap Frango', 'Wrap de frango com salada e molho caesar', 'Marmita'),
('Wrap Carne', 'Wrap de carne com queijo e molho barbecue', 'Marmita'),

-- ═══════════════════════════════════════════════════════════════
-- PADARIA / CAFÉ DA MANHÃ
-- ═══════════════════════════════════════════════════════════════
('Pão Francês 6 Unidades', '6 pães franceses frescos', 'Padaria'),
('Pão Francês 12 Unidades', '12 pães franceses frescos', 'Padaria'),
('Pão de Queijo 6 Unidades', '6 pães de queijo', 'Padaria'),
('Pão de Queijo 12 Unidades', '12 pães de queijo', 'Padaria'),
('Pão de Queijo Mini 20 Unidades', '20 mini pães de queijo', 'Padaria'),
('Croissant Manteiga', 'Croissant de manteiga', 'Padaria'),
('Croissant Presunto e Queijo', 'Croissant recheado com presunto e queijo', 'Padaria'),
('Croissant Chocolate', 'Croissant recheado com chocolate', 'Padaria'),
('Misto Quente', 'Pão de forma com presunto e queijo na chapa', 'Padaria'),
('Bauru', 'Pão francês com presunto, queijo e tomate na chapa', 'Padaria'),
('Café Coado Pequeno', 'Café coado 150ml', 'Padaria'),
('Café Coado Médio', 'Café coado 250ml', 'Padaria'),
('Café Coado Grande', 'Café coado 400ml', 'Padaria'),
('Café com Leite Pequeno', 'Café com leite 150ml', 'Padaria'),
('Café com Leite Médio', 'Café com leite 250ml', 'Padaria'),
('Café com Leite Grande', 'Café com leite 400ml', 'Padaria'),
('Cappuccino', 'Cappuccino com canela', 'Padaria'),
('Cappuccino Especial', 'Cappuccino com chantilly e canela', 'Padaria'),
('Mocha', 'Café com chocolate e leite', 'Padaria'),
('Latte', 'Café latte cremoso', 'Padaria'),
('Expresso', 'Café expresso', 'Padaria'),
('Chocolate Quente', 'Chocolate quente cremoso', 'Padaria'),
('Café Gelado', 'Café gelado com leite', 'Padaria'),
('Suco de Laranja Natural 300ml', 'Suco de laranja natural', 'Padaria'),
('Suco de Limão Natural 300ml', 'Suco de limão natural', 'Padaria'),
('Tapioca Queijo', 'Tapioca com queijo derretido', 'Padaria'),
('Tapioca Presunto e Queijo', 'Tapioca com presunto e queijo', 'Padaria'),
('Tapioca Frango com Catupiry', 'Tapioca com frango e catupiry', 'Padaria'),
('Tapioca Banana com Canela', 'Tapioca doce com banana e canela', 'Padaria'),
('Tapioca Chocolate', 'Tapioca doce com chocolate', 'Padaria'),
('Bolo de Chocolate Fatia', 'Fatia de bolo de chocolate', 'Padaria'),
('Bolo de Cenoura Fatia', 'Fatia de bolo de cenoura com cobertura', 'Padaria'),
('Bolo de Fubá Fatia', 'Fatia de bolo de fubá', 'Padaria'),
('Bolo de Milho Fatia', 'Fatia de bolo de milho', 'Padaria'),
('Sonho Recheado', 'Sonho com creme', 'Padaria'),

-- ═══════════════════════════════════════════════════════════════
-- CREPES / PANQUECAS
-- ═══════════════════════════════════════════════════════════════
('Crepe Frango c/ Catupiry', 'Crepe de frango com catupiry', 'Crepes'),
('Crepe Presunto e Queijo', 'Crepe de presunto com queijo', 'Crepes'),
('Crepe Carne', 'Crepe de carne moída com queijo', 'Crepes'),
('Crepe Calabresa', 'Crepe de calabresa com queijo', 'Crepes'),
('Crepe Camarão', 'Crepe de camarão com catupiry', 'Crepes'),
('Crepe Palmito', 'Crepe de palmito com queijo', 'Crepes'),
('Crepe Doce Chocolate', 'Crepe doce com chocolate', 'Crepes'),
('Crepe Doce Nutella c/ Morango', 'Crepe doce com Nutella e morango', 'Crepes'),
('Crepe Doce Banana Canela', 'Crepe doce com banana e canela', 'Crepes'),
('Crepe Doce Romeu e Julieta', 'Crepe doce com goiabada e queijo', 'Crepes'),
('Panqueca de Carne', 'Panqueca de carne moída com molho', 'Crepes'),
('Panqueca de Frango', 'Panqueca de frango com molho', 'Crepes'),
('Panqueca de Queijo', 'Panqueca de queijo com molho', 'Crepes'),

-- ═══════════════════════════════════════════════════════════════
-- PASTEL (JÁ EXISTE NA 0007, ADICIONAR MAIS)
-- ═══════════════════════════════════════════════════════════════
('Pastel de Queijo Grande', 'Pastel grande recheado com queijo', 'Pastéis'),
('Pastel de Carne Grande', 'Pastel grande recheado com carne moída', 'Pastéis'),
('Pastel de Frango Grande', 'Pastel grande recheado com frango', 'Pastéis'),
('Pastel de Pizza Grande', 'Pastel grande com mussarela e tomate', 'Pastéis'),
('Pastel de Calabresa Grande', 'Pastel grande com calabresa e queijo', 'Pastéis'),
('Pastel de Palmito Grande', 'Pastel grande com palmito e queijo', 'Pastéis'),
('Pastel de Camarão Grande', 'Pastel grande com camarão e catupiry', 'Pastéis'),
('Pastel de Catupiry Grande', 'Pastel grande recheado com catupiry', 'Pastéis'),
('Pastel Misto Grande', 'Pastel grande com presunto e queijo', 'Pastéis'),
('Pastel de Bacalhau Grande', 'Pastel grande com bacalhau', 'Pastéis'),

-- ═══════════════════════════════════════════════════════════════
-- SALGADINHOS / COXINHA / EMPADA
-- ═══════════════════════════════════════════════════════════════
('Coxinha de Frango 6 Unidades', '6 coxinhas de frango com catupiry', 'Salgados'),
('Coxinha de Frango 12 Unidades', '12 coxinhas de frango com catupiry', 'Salgados'),
('Coxinha de Calabresa 6 Unidades', '6 coxinhas de calabresa', 'Salgados'),
('Bolinha de Queijo 6 Unidades', '6 bolinhas de queijo', 'Salgados'),
('Bolinha de Queijo 12 Unidades', '12 bolinhas de queijo', 'Salgados'),
('Risole de Presunto e Queijo 6 Unidades', '6 risoles de presunto e queijo', 'Salgados'),
('Risole de Camarão 6 Unidades', '6 risoles de camarão', 'Salgados'),
('Empada de Frango 6 Unidades', '6 empadas de frango', 'Salgados'),
('Empada de Palmito 6 Unidades', '6 empadas de palmito', 'Salgados'),
('Empada de Camarão 6 Unidades', '6 empadas de camarão', 'Salgados'),
('Enroladinho de Salsicha 6 Unidades', '6 enroladinhos de salsicha', 'Salgados'),
('Bauru Frito 3 Unidades', '3 baurus fritos com presunto e queijo', 'Salgados'),
('Kibe 6 Unidades', '6 kibes de carne', 'Salgados'),
('Kibe 12 Unidades', '12 kibes de carne', 'Salgados'),
('Esfiha de Carne 6 Unidades', '6 esfihas abertas de carne', 'Salgados'),
('Esfiha de Queijo 6 Unidades', '6 esfihas abertas de queijo', 'Salgados'),
('Esfiha de Calabresa 6 Unidades', '6 esfihas de calabresa', 'Salgados'),
('Croquete de Carne 6 Unidades', '6 croquetes de carne', 'Salgados'),
('Joelho de Queijo 3 Unidades', '3 joelhos de queijo', 'Salgados'),
('Salgado Sortido 12 Unidades', '12 salgados variados (coxa, kibe, risole, bolinha)', 'Salgados'),
('Salgado Sortido 24 Unidades', '24 salgados variados', 'Salgados'),

-- ═══════════════════════════════════════════════════════════════
-- AÇAÇARIA / DOCES BRASILEIROS
-- ═══════════════════════════════════════════════════════════════
('Brigadeiro 6 Unidades', '6 brigadeiros de chocolate', 'Doces'),
('Brigadeiro 12 Unidades', '12 brigadeiros de chocolate', 'Doces'),
('Brigadeiro Branco 6 Unidades', '6 brigadeiros brancos', 'Doces'),
('Beijinho 6 Unidades', '6 beijinhos de coco', 'Doces'),
('Beijinho 12 Unidades', '12 beijinhos de coco', 'Doces'),
('Cajuzinho 6 Unidades', '6 cajuzinhos de amendoim', 'Doces'),
('Olho de Sogra 6 Unidades', '6 olhos de sogra', 'Doces'),
('Docinho de Maracujá 6 Unidades', '6 docinhos de maracujá', 'Doces'),
('Docinho de Nozes 6 Unidades', '6 docinhos de nozes', 'Doces'),
('Bolo de Pote Chocolate', 'Bolo de pote de chocolate com chantilly', 'Doces'),
('Bolo de Pote Ninho com Morango', 'Bolo de pote de leite ninho com morango', 'Doces'),
('Bolo de Pote Red Velvet', 'Bolo de pote red velvet com cream cheese', 'Doces'),
('Pudim Individual', 'Pudim de leite condensado individual', 'Doces'),
('Pudim Grande', 'Pudim de leite condensado inteiro', 'Doces'),
('Mousse de Maracujá', 'Mousse de maracujá individual', 'Doces'),
('Mousse de Chocolate', 'Mousse de chocolate individual', 'Doces'),
('Mousse de Limão', 'Mousse de limão individual', 'Doces'),
('Gelatina Colorida', 'Gelatina colorida individual', 'Doces'),
('Paçoca Amendoim', 'Paçoca de amendoim', 'Doces'),
('Canjica Doce', 'Canjica com canela e leite condensado', 'Doces'),

-- ═══════════════════════════════════════════════════════════════
-- BEBIDAS QUENTES / ESPECIAIS
-- ═══════════════════════════════════════════════════════════════
('Chocolate Quente', 'Chocolate quente cremoso com chantilly', 'Bebidas Quentes'),
('Chocolate Quente com Marshmallow', 'Chocolate quente com marshmallow', 'Bebidas Quentes'),
('Café Especial', 'Café especial Premium 250ml', 'Bebidas Quentes'),
('Café Especial com Leite', 'Café especial com leite cremoso', 'Bebidas Quentes'),
('Chá de Camomila', 'Chá de camomila 250ml', 'Bebidas Quentes'),
('Chá de Hortelã', 'Chá de hortelã 250ml', 'Bebidas Quentes'),
('Chá Mate com Limão', 'Chá mate gelado com limão 450ml', 'Bebidas Quentes'),
('Quentão', 'Vinho quente com especiarias (época de festa)', 'Bebidas Quentes'),

-- ═══════════════════════════════════════════════════════════════
-- DRINKS / COQUETÉIS (SEM ÁLCOOL)
-- ═══════════════════════════════════════════════════════════════
('Limonada Suíça', 'Limonada com leite condensado e gelo', 'Drinks'),
('Limonada com Hortelã', 'Limonada refrescante com hortelã', 'Drinks'),
('Suco Verde Detox', 'Suco de couve, maçã, gengibre e limão', 'Drinks'),
('Água de Coco Natural 500ml', 'Água de coco natural', 'Drinks'),
('Smoothie Morango', 'Smoothie cremoso de morango com iogurte', 'Drinks'),
('Smoothie Manga', 'Smoothie cremoso de manga com iogurte', 'Drinks'),
('Smoothie Proteico', 'Smoothie com whey, banana e aveia', 'Drinks'),

-- ═══════════════════════════════════════════════════════════════
-- DRINKS COM ÁLCOOL
-- ═══════════════════════════════════════════════════════════════
('Caipirinha de Limão', 'Cachaça, limão, açúcar e gelo', 'Drinks com Álcool'),
('Caipirinha de Morango', 'Cachaça, morango, açúcar e gelo', 'Drinks com Álcool'),
('Caipirinha de Maracujá', 'Cachaça, maracujá, açúcar e gelo', 'Drinks com Álcool'),
('Caipiroska de Limão', 'Vodka, limão, açúcar e gelo', 'Drinks com Álcool'),
('Caipiroska de Morango', 'Vodka, morango, açúcar e gelo', 'Drinks com Álcool'),
('Mojito', 'Rum, hortelã, limão, açúcar e soda', 'Drinks com Álcool'),
('Gin Tônica', 'Gin, tônica e limão', 'Drinks com Álcool'),
('Piña Colada', 'Rum, leite de coco e abacaxi', 'Drinks com Álcool'),
('Margarita', 'Tequila, limão e sal na borda', 'Drinks com Álcool'),
('Bloody Mary', 'Vodka, suco de tomate e temperos', 'Drinks com Álcool'),

-- ═══════════════════════════════════════════════════════════════
-- VINHOS
-- ═══════════════════════════════════════════════════════════════
('Vinho Tinto Taça', 'Taça de vinho tinto da casa', 'Vinhos'),
('Vinho Branco Taça', 'Taça de vinho branco da casa', 'Vinhos'),
('Vinho Tinto Garrafa', 'Garrafa de vinho tinto', 'Vinhos'),
('Vinho Branco Garrafa', 'Garrafa de vinho branco', 'Vinhos'),
('Vinho Rosé Garrafa', 'Garrafa de vinho rosé', 'Vinhos'),
('Espumante Garrafa', 'Garrafa de espumante', 'Vinhos'),

-- ═══════════════════════════════════════════════════════════════
-- AÇOUGUE / ESPETINHOS
-- ═══════════════════════════════════════════════════════════════
('Espetinho de Carne', 'Espetinho de carne bovina com sal e alho', 'Espetinhos'),
('Espetinho de Frango', 'Espetinho de frango temperado', 'Espetinhos'),
('Espetinho de Coração', 'Espetinho de coração de galinha', 'Espetinhos'),
('Espetinho de Linguiça', 'Espetinho de linguiça acebolada', 'Espetinhos'),
('Espetinho de Queijo', 'Espetinho de queijo coalho', 'Espetinhos'),
('Espetinho Misto 5 Unidades', '5 espetinhos variados (carne, frango, coração, linguiça, queijo)', 'Espetinhos'),
('Espetinho Misto 10 Unidades', '10 espetinhos variados', 'Espetinhos'),
('Picanha na Brasa 300g', 'Picanha grelhada com arroz e farofa', 'Espetinhos'),
('Maminha na Brasa 300g', 'Maminha grelhada com arroz e vinagrete', 'Espetinhos'),
('Alcatra na Brasa 300g', 'Alcatra grelhada com arroz e batata frita', 'Espetinhos'),

-- ═══════════════════════════════════════════════════════════════
-- PETISCOS / BAR
-- ═══════════════════════════════════════════════════════════════
('Porção de Amendoim', 'Amendoim salgado e torrado', 'Petiscos'),
('Porção de Castanha de Caju', 'Castanha de caju salgada', 'Petiscos'),
('Porção de Azeitonas', 'Azeitonas verdes temperadas', 'Petiscos'),
('Bruschetta de Tomate', 'Bruschettas com tomate, manjericão e azeite (4 unidades)', 'Petiscos'),
('Bruschetta de Carne', 'Bruschettas com carne desfiada e queijo (4 unidades)', 'Petiscos'),
('Tábua de Frios Pequena', 'Queijo, presunto, salame, azeitonas e torradas', 'Petiscos'),
('Tábua de Frios Grande', 'Queijos variados, frios, azeitonas, torradas e geleias', 'Petiscos'),
('Bolinho de Aipim com Carne 8 Unidades', '8 bolinhos de aipim recheados com carne', 'Petiscos'),
('Bolinho de Mandioca com Queijo 8 Unidades', '8 bolinhos de mandioca com queijo', 'Petiscos'),

-- ═══════════════════════════════════════════════════════════════
-- SAUDÁVEL / FITNESS
-- ═══════════════════════════════════════════════════════════════
('Salada Caesar com Frango', 'Alface, croutons, parmesão, frango e molho caesar', 'Fitness'),
('Salada Caesar sem Frango', 'Alface, croutons, parmesão e molho caesar', 'Fitness'),
('Salada Mediterrânea', 'Mix de folhas, tomate cereja, azeitonas, queijo feta e azeite', 'Fitness'),
('Salada Tropical com Frango', 'Mix de folhas, manga, frango grelhado e molho de iogurte', 'Fitness'),
('Wrap Integral Frango', 'Wrap integral com frango, alface, tomate e molho caesar', 'Fitness'),
('Wrap Integral Atum', 'Wrap integral com atum, cenoura e molho', 'Fitness'),
('Bowl Proteico', 'Arroz integral, frango grelhado, ovo, abacate e molho', 'Fitness'),
('Bowl Vegano', 'Arroz integral, grão de bico, abobora, couve e molho tahine', 'Fitness'),
('Sanduíche Natural Frango', 'Pão integral com frango, cream cheese e salada', 'Fitness'),
('Sanduíche Natural Atum', 'Pão integral com atum, milho e maionese', 'Fitness'),
('Sanduíche Natural Ricota', 'Pão integral com ricota, cenoura e peito de peru', 'Fitness'),
('Suco Detox Verde', 'Couve, maçã, gengibre, limão e mel', 'Fitness'),
('Suco Detox Laranja', 'Cenoura, laranja e gengibre', 'Fitness'),
('Vitamina Proteica', 'Whey protein, banana, aveia e leite desnatado', 'Fitness'),
('Açaí Proteico 500ml', 'Açaí com whey, banana, granola sem açúcar e mel', 'Fitness'),

-- ═══════════════════════════════════════════════════════════════
-- COMBOS ESPECIAIS
-- ═══════════════════════════════════════════════════════════════
('Combo Pizza + Refri', 'Pizza grande + refrigerante 2L', 'Combos Especiais'),
('Combo Pizza + Esfihas', 'Pizza grande + 6 esfihas', 'Combos Especiais'),
('Combo Sushi + Temaki', 'Combo 20 peças + 1 temaki', 'Combos Especiais'),
('Combo Churrasco 2 Pessoas', 'Picanha 500g + arroz + farofa + vinagrete + 2 cervejas', 'Combos Especiais'),
('Combo Churrasco 4 Pessoas', 'Picanha 1kg + arroz + farofa + vinagrete + batata + 4 cervejas', 'Combos Especiais'),
('Combo Café da Manhã 2 Pessoas', '2 cafés com leite + 2 mistos quentes + 2 sucos + pão de queijo', 'Combos Especiais'),
('Combo Café da Manhã Família', '4 cafés + 4 sucos + cesta de pães + manteiga + presunto + queijo', 'Combos Especiais'),
('Combo Açaí Duplo', '2 açaís 500ml com todos os acompanhamentos', 'Combos Especiais'),
('Combo Happy Hour', 'Porção de batata + 6 espetinhos + 4 cervejas', 'Combos Especiais'),
('Combo Kids Festa', 'Mini pizza + suco + sorvete + brigadeiro', 'Combos Especiais'),

-- ═══════════════════════════════════════════════════════════════
-- ADICIONAIS EXTRAS
-- ═══════════════════════════════════════════════════════════════
('Extra Catupiry', 'Porção extra de catupiry', 'Adicionais'),
('Extra Cream Cheese', 'Porção extra de cream cheese', 'Adicionais'),
('Extra Cream Cheese Sushi', 'Cream cheese para sushi', 'Adicionais'),
('Extra Molho BBQ', 'Molho barbecue extra', 'Adicionais'),
('Extra Molho Tarê', 'Molho tarê para sushi', 'Adicionais'),
('Extra Molho Shoyu', 'Molho shoyu extra', 'Adicionais'),
('Extra Wasabi', 'Wasabi extra', 'Adicionais'),
('Extra Gengibre', 'Gengibre para sushi', 'Adicionais'),
('Extra Geleia de Pimenta', 'Geleia de pimenta extra', 'Adicionais'),
('Extra Rúcula', 'Porção extra de rúcula', 'Adicionais'),
('Extra Banana', 'Banana extra para açaí/suco', 'Adicionais'),
('Extra Morango', 'Morangos extras', 'Adicionais'),
('Extra Granola', 'Granola extra para açaí', 'Adicionais'),
('Extra Leite Condensado', 'Leite condensado extra', 'Adicionais'),
('Extra Nutella', 'Nutella extra', 'Adicionais'),
('Extra Chantilly', 'Chantilly extra', 'Adicionais'),
('Borda de Catupiry', 'Borda recheada de catupiry para pizza', 'Adicionais'),
('Borda de Cheddar', 'Borda recheada de cheddar para pizza', 'Adicionais'),
('Borda de Chocolate', 'Borda recheada de chocolate para pizza', 'Adicionais');

commit;
