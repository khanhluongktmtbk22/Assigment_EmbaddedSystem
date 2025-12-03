const whiteListDomains = [
  "http://localhost:5173",
  "http://localhost:1469",
  "http://localhost:3000",
  undefined,
];

export const corsOptions = {
  origin: function (origin, callback) {
    if (whiteListDomains.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};
