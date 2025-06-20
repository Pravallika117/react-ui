# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

This application can be run as a static web application on S3. Steps to do that:

Run "npm run dev" and upload the contents of dist folder in the same folder format as they are, to the S# bucket. Enable static website hosting.

At this point, the applcation is not secured and cannot be accessed, To secure and create a domain for this, make use of AWS CloudFront. 

To enable authentication use Cognito. 

This application is integrated with lambda application through an API gateway service. The requests are authorized by sending id_token of the user to the API gateway for every request. The expectation that every request should be authorized is also configured in the API gateway(for every method of every resource)

This UI application is also integrated with S3, to generate a SIGNED URL for audio files in a separate s3 bucket. This is acheived through a concept called Cognito Identity pool which would provide temporary tokens to the access the AWS services.
