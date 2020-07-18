$("#buy-button").on("click", function() {
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

  const getTotal = productArray => {
    const total = productArray.reduce(
      (total, product) => total + product.price * product.qty,
      0
    );

    return `<tr>
        <td>&nbsp;</th>
        <td class="font-weight-bold">Total:</td>
        <td class="font-weight-bold">$${total.toFixed(2)}</td>
      </tr>`;
  };

  const tablePrefix = `<p>You have selected the following products to order:</p>
    <table class="table">
      <thead>
        <tr>
          <th scope="col">Product</th>
          <th scope="col">Quantity</th>
          <th scope="col">Unit price</th>
        </tr>
      </thead>
    <tbody>`;

  const tableSuffix = `</tbody>
    </table>`;

  const tableContent = selectedProducts
    .map(
      sp =>
        `<tr>
          <td>${sp.name}</th>
          <td>${sp.qty}</td>
          <td>$${sp.price}</td>
        </tr>`
    )
    .join("");
  $("#confirmationModal .modal-body")
    .empty()
    .append(
      tablePrefix + tableContent + getTotal(selectedProducts) + tableSuffix
    );
  $("#confirmationModal").modal();
});
