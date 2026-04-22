# SageMaker Audit Dashboard — Live Demo

A public, interactive demo of the audit dashboard SecuredPress delivers to clients
during SageMaker cost and security engagements. All data is synthetic, representing
a typical mid-size production SageMaker deployment.

**Live demo:** [demo.securedpress.com](https://demo.securedpress.com)
**Learn more:** [securedpress.com](https://securedpress.com)

## What you can explore

- **Executive Overview** — Savings estimate, risk score, and findings summary at a glance
- **Cost** — Endpoint utilization, training job spend, notebook waste, and storage costs with prioritized savings recommendations
- **Security** — IAM, encryption, network, logging, and compliance findings with severity ratings and remediation guidance
- **Scan History** — Posture trending across scans, showing how findings and risk scores evolve over time

## About the data

Every number, finding, and recommendation in this demo is synthetic. The dashboard
architecture, code, and UI are production-grade — the same components deployed in
client engagements — but the client profile, AWS account ID, endpoints, and findings
are fabricated for illustration.

## Stack

- Next.js 15 (App Router)
- Tremor 3 for charts and data visualization
- Tailwind CSS 3 for styling
- TypeScript 5
- AWS Amplify Hosting for deployment

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## About SecuredPress

SecuredPress delivers AI/ML cost and security audits for AWS SageMaker and Bedrock
environments. Each engagement includes a live audit dashboard, exportable PDF findings
report, and a production-ready baseline deployed through code.

Learn more at [securedpress.com](https://securedpress.com).

## License

MIT — see [LICENSE](./LICENSE).
