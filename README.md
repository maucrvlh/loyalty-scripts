## Loyalty Scripts
---

## Início rápido
Clone o repositório e execute:

```shell
$ npm install && npm run pkg-linux [ou pkg-all para gerar o executável para todos os SOs]
```

---

## Programa `update-coupons`
Sintaxe:

```
loyalty update-coupons <arquivo csv> -c credenciais
```

Exemplo:

```shell
$ loyalty update-coupons -c /path/das/credenciais-qa.json /path/do/arquivo-qa.csv
```

## Programa `relatorio`
Sintaxe:

```
loyalty relatorio <modelo> -c credenciais -i data-início -t data-fim
```

Exemplo:

```shell
$ loyalty relatorio completo -c /path/das/credenciais-prd.json -i 2020-10-01T00:00:00 -t 2020-10-02T00:00:00
```

- Modelos disponíveis
    - completo
    - aprovados

### Mais detalhes

```shell
$ loyalty help relatorio
```