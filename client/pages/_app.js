import "bootstrap/dist/css/bootstrap.css";
import { buildClient } from "../api/buildClient";
import Header from "../components/header";

let AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <div>
      <Header currentUser={currentUser} />
      <div className="container">
        <Component {...pageProps} currentUser={currentUser} />
      </div>
    </div>
  );
};

AppComponent.getInitialProps = async (appContext) => {
  let client = buildClient(appContext.ctx);
  let { data } = await client.get("/api/users/currentuser");

  let pageProps = {};
  if (appContext.Component.getInitialProps) {
    //we are going to call that "getInitialProps" for them
    pageProps = await appContext.Component.getInitialProps(
      appContext.ctx,
      client,
      data.currentUser
    );
  }

  return {
    pageProps,
    ...data,
  };
};

export default AppComponent;
