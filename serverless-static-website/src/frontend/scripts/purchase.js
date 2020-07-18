$("#confirmPurchase").on("click", function() {
  const selectedProducts = [];
  $("input:checked").each(function() {
    const parent = $(this)
      .parent()
      .parent()
      .parent();

    const qty = $(parent)
      .find("#qty")
      .val();
    const price = $(parent)
      .find("#RetailUnitPrice")
      .attr("data-price");

    selectedProducts.push({
      name: $(this).val(),
      id: $(this).prop("id"),
      qty: qty,
      price: price
    });
  });

  const apiKey = $("#api-key-input").val();

  if (!apiKey) {
    showProvideApiKey();
    return;
  }

  // DEV
  // const url =
  //   "https://u8e0yimqpc.execute-api.ap-southeast-2.amazonaws.com/dev/products/order";

  // PROD
  const url =
    "https://fp4vid2tef.execute-api.ap-southeast-2.amazonaws.com/prod/products/order";

  // LOCAL
  // const url = "http://localhost:3000/products/order";

  $.ajax({
    method: "POST",
    url: url,
    headers: {
      "x-api-key": apiKey
    },
    data: JSON.stringify(selectedProducts),
    beforeSend: () => showLoading()
  })
    .done(purchaseOnDone)
    .fail(error => purchaseOnFailure(error));
});

const purchaseOnDone = () => {
  accordion.empty();
  accordion.append(
    `<form action="index.html">
      <div class="form-group">
        <div class="alert alert-success" role="alert">Purchase completed.</div>
      </div>
      <button type="submit" class="btn btn-outline-success">Back</button>
    </form>`
  );
};

const purchaseOnFailure = error => {
  accordion.empty();
  console.log(error);
  accordion.append(
    `<div class="alert alert-danger" role="alert">Something went wrong.</div>`
  );
};
