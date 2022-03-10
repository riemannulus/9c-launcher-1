import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import Layout from "../../components/core/Layout";
import { useStore } from "src/v2/utils/useStore";
import { ipcRenderer } from "electron";
import { useHistory } from "react-router";
import { CSS, styled } from "src/v2/stitches.config";

import H1 from "src/v2/components/ui/H1";
import { PasswordField } from "src/v2/components/ui/TextField";
import Button from "src/v2/components/ui/Button";
import { Select, SelectOption } from "src/v2/components/ui/Select";
import { Link } from "src/v2/components/ui/Link";
import { T } from "src/renderer/i18n";
import Form from "src/v2/components/ui/Form";

const transifexTags = "v2/login-view";

function LoginView() {
  const { account } = useStore();
  const [password, setPassword] = useState("");
  const [invalid, setInvalid] = useState(false);
  const history = useHistory();

  const handleLogin = () => {
    const [unprotectedPrivateKey, error] = ipcRenderer.sendSync(
      "unprotect-private-key",
      account.selectedAddress,
      password
    );
    if (error !== undefined) {
      setInvalid(true);
      ipcRenderer.send("mixpanel-track-event", "Launcher/LoginFailed");
    }

    if (unprotectedPrivateKey !== undefined) {
      account.setPrivateKey(unprotectedPrivateKey);
      account.setLoginStatus(true);
      ipcRenderer.send("mixpanel-alias", account.selectedAddress);
      ipcRenderer.send("mixpanel-track-event", "Launcher/Login");
      ipcRenderer.send("standalone/set-signer-private-key", account.privateKey);
      localStorage.setItem("lastAddress", account.selectedAddress);
      history.push("/lobby");
    }
  };

  useEffect(() => {
    const defaultAddress =
      localStorage.getItem("lastAddress") ?? account.addresses[0];
    if (!account.selectedAddress && account.addresses.length > 0) {
      account.setSelectedAddress(defaultAddress); // TODO: Persist the last chosen address
    }
  }, [account.addresses, account.selectedAddress]);

  return (
    <Layout sidebar flex>
      <H1>
        <T _str="Login" _tags={transifexTags} />
      </H1>
      <p>
        <T _str="Welcome back Nine Chronicles!" _tags={transifexTags} />
      </p>
      <Form onSubmit={(e) => e.preventDefault()}>
        <Select
          value={account.selectedAddress}
          onChange={(v) => account.setSelectedAddress(v)}
        >
          {account.addresses.map((address) => (
            <SelectOption key={address} value={address}>
              {address}
            </SelectOption>
          ))}
        </Select>
        <PasswordField
          label="Password"
          value={password}
          invalid={invalid}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
        <Button
          variant="primary"
          centered
          onClick={handleLogin}
          css={{ width: 280 }}
        >
          <T _str="LOGIN" _tags={transifexTags} />
        </Button>
      </Form>
      <Link centered to="/forgot">
        <T _str="Forgot password?" _tags={transifexTags} />
      </Link>
    </Layout>
  );
}

export default observer(LoginView);
