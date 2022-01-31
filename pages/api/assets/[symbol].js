import { fetchBridgeTokenList } from "@/api/assets/index.js";

export async function token(symbol) {
  const tokensFolder =
    "https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens";

  const tokens = await fetchBridgeTokenList();
  const findPath = tokens.filter(
    (entry) => entry.symbol.toLowerCase() == symbol.toLowerCase()
  );

  let token = {};
  if (findPath.length) {
    try {
      let path = findPath[0].path;
      token = await fetch(tokensFolder + "/" + path).then((r) => r.json());
      token["symbol"] = path.includes("testnet")
        ? token["symbol"] + "_testnet"
        : token["symbol"];
    } catch (error) {
      console.log(error);
    }
  }
  return token;
}

export default async function handler(req, res) {
  const { query, method } = req;
  switch (method) {
    case "GET":
      try {
        const tokenData = await token(query.symbol);
        res.status(200).json({
          object: "asset",
          data: tokenData,
          errors: [],
        });
      } catch (error) {
        res.status(500).json({ errors: ["Failed to load data: " + error] });
      }
      break;

    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
