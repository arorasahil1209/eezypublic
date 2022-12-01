const SellingPartnerAPI = require("amazon-sp-api");

async function execute_sp_api(operation, endpoint, path, query) {
  try {
    let sellingPartner = new SellingPartnerAPI({
      region: "eu",
      options: {
        only_grantless_operations: false,
      },
      refresh_token:
        "Atzr|IwEBIA3Ed8EWyiYm8NUE54LpmimZlbT7smQYaWVljxIgXYE1NWBSGYVooyQUBwHg37ROAXnOVDNGr3HqbjLLMlWZp_FumIyXA8WQFhIxl5xqQ52joIdg8GhnD56lkDymniDRIN-IYzG2O4jQobJGfAAX42BiIuUBnmgzfnT6xMfpWj-NKvNU4knprR0bUo6O8ZegK3-ubID2tRqzt9P3SpZBn2yu1yOfn2EL2S9j1xYoPdiwS9_yq4m9pq26Ws93N4Un_AHPX6Rm62C8zVres_WlYcE_DxHZA1JRR2e30giIye6WNGuKskZ-sIwe88WCYhJWiFz0u1z7y0JxnZp-R1k5SVov",
      credentials: {
        SELLING_PARTNER_APP_CLIENT_ID:
          "amzn1.application-oa2-client.65458ab2d81f49c3bc62ad0bc728194c",
        SELLING_PARTNER_APP_CLIENT_SECRET:
          "29ae6d6e75d78871f7d2c5ccd913c678a6224e4e3c440117e6a9ac2cb1f705d2",
        AWS_ACCESS_KEY_ID: "AKIATYB6BSGNUBWW6KMU",
        AWS_SECRET_ACCESS_KEY: "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",
        AWS_SELLING_PARTNER_ROLE:
          "arn:aws:iam::257828163995:role/SellingPartnerAPI-Role",
      },
    });
    let res = await sellingPartner.callAPI({
      operation: operation,
      endpoint: endpoint,
      path: path,
      query: query,
    });
    console.log(JSON.stringify(res));
    return res;
  } catch (e) {
    console.log(e);
  }
}
module.exports = {
  execute_sp_api,
};
