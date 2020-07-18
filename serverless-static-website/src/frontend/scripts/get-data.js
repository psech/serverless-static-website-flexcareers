const accordionId = "productsAccordion";
const accordion = $(`#${accordionId}`);

// DEV
// const url =
//   "https://u8e0yimqpc.execute-api.ap-southeast-2.amazonaws.com/dev/products/available";

// PROD
const url =
  "https://fp4vid2tef.execute-api.ap-southeast-2.amazonaws.com/prod/products/available";

// LOCAL
// const url = "http://localhost:3000/products/available";

$("#api-key-form").submit(() => {
  const apiKey = $("#api-key-input").val();

  if (!apiKey) {
    showProvideApiKey();
    return;
  }

  $.ajax({
    method: "GET",
    url: url,
    headers: {
      "x-api-key": apiKey
    },
    beforeSend: () => showLoading()
  })
    .done(data => gatDataOnDone(data))
    .fail(error => getDataOnFailure(error));
});

const showLoading = () => {
  accordion.empty();
  accordion.append(
    `<div class="spinner-grow m-5" style="width: 3rem; height: 3rem;" role="status">
      <span class="sr-only">Loading...</span>
    </div>`
  );
};

const showProvideApiKey = () => {
  accordion.empty();
  accordion.append(
    `<div class="alert alert-info" role="alert">Please provide API Key.</div>`
  );
};

const gatDataOnDone = data => {
  accordion.empty();
  const productGroups = data.ProductGroups;

  $.each(productGroups, index => {
    accordion.append(genSingleCard(productGroups[index], index));
  });

  $("input[id='qty']").inputSpinner();
};

const getDataOnFailure = error => {
  accordion.empty();
  console.log(error);
  accordion.append(
    `<div class="alert alert-danger" role="alert">Something went wrong.</div>`
  );
};

const genSingleCard = (productGroup, index) => {
  const cardId = productGroup.GroupName;
  const products = productGroup.Products;

  return `<div class="card">
    <div class="card-header" id="${cardId}">
      <h2 class="mb-0">
        <button class="btn btn-link collapsed" type="button" data-toggle="collapse" data-target="#collapse-${index}" aria-expanded="false" aria-controls="collapse-${index}">
          ${cardId}
        </button>
      </h2>
    </div>
    <div id="collapse-${index}" class="collapse" aria-labelledby="${cardId}" data-parent="#${accordionId}">
      <div class="card-body">
        ${genCardContent(products)}
      </div>
    </div>
  </div>`;
};

const genCardContent = products => {
  const genProducts = products => {
    return products.reduce((acc, product) => {
      return acc.concat(genSingleProduct(product));
    }, "");
  };

  const listGroupMarkup = `<ul class="custom-control custom-checkbox" id="product-list">
      ${genProducts(products)}
    </ul>`;

  return listGroupMarkup;
};

const genSingleProduct = product => {
  return `<div class="input-group mb-3">
      <div class="input-group-prepend">
        <div class="input-group-text">
          <input type="checkbox" 
            id="${product.ProductId}" 
            value="${product.ProductName}"
          >
        </div>
      </div>
      <input type="text" disabled class="form-control" value="
        ${product.ProductName}
      ">
      <div class="input-group-append">
        <span class="input-group-text" id="RetailUnitPrice" 
          data-price="${product.RetailUnitPrice.toFixed(2)}">
            $${product.RetailUnitPrice.toFixed(2)}
        </span>
        <div role="separator" class="dropdown-divider"></div>
        <input id="qty" class="form-control short-input" type="number" value="1" min="0" step="1"/>
      </div>
    </div>`;
};

showProvideApiKey();
