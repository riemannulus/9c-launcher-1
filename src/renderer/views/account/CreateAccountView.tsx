import React, { useState, ChangeEvent, MouseEvent } from "react";
import mixpanel from "mixpanel-browser";
import { observer, inject } from "mobx-react";
import {
  Button,
  FormControl,
  InputLabel,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
} from "@material-ui/core";

import VisibilityAdornment from "../../components/VisibilityAdornment";

import { ExecutionResult } from "react-apollo";
import { IStoreContainer } from "../../../interfaces/store";

import {
  useCreatePrivateKeyMutation,
  CreatePrivateKeyMutation,
} from "../../../generated/graphql";

import AccountStore from "../../stores/account";
import createAccountViewStyle from "./CreateAccountView.style";
import { RouterStore } from "mobx-react-router";

import { useLocale } from "../../i18n";
import { CreateAccount } from "../../../interfaces/i18n";

interface ICreateAccountProps {
  accountStore: AccountStore;
  routerStore: RouterStore;
}

const CreateAccountView = observer(
  ({ accountStore, routerStore }: ICreateAccountProps) => {
    const [createAccount, { data }] = useCreatePrivateKeyMutation();
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

    const { locale } = useLocale<CreateAccount>("createAccount");

    const classes = createAccountViewStyle();

    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
    };

    const handlePasswordConfirmChange = (e: ChangeEvent<HTMLInputElement>) => {
      setPasswordConfirm(e.target.value);
    };

    const handleShowPassword = (e: MouseEvent<HTMLButtonElement>) => {
      setShowPassword(!showPassword);
    };

    const handleShowPasswordConfirm = (e: MouseEvent<HTMLButtonElement>) => {
      setShowPasswordConfirm(!showPasswordConfirm);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      mixpanel.track("Launcher/CreatePrivateKey");
      createAccount({
        variables: {
          passphrase: password,
        },
      }).then((e: ExecutionResult<CreatePrivateKeyMutation>) => {
        const keyStore = e.data?.keyStore;
        if (null == keyStore) {
          return;
        }
        const address = keyStore.createPrivateKey.publicKey.address;
        const privateKey = keyStore.createPrivateKey.hex;

        accountStore.setPrivateKey(privateKey);
        accountStore.addAddress(address);
        accountStore.setSelectedAddress(address);
        routerStore.push("/account/create/copy");
      });
    };

    return (
      <div className={`create-account ${classes.root}`}>
        <Typography variant="h1" className={classes.info}>
          {(locale(
            "계정 생성을 마치기 위해 비밀번호를 설정해주세요."
          ) as string[]).map((paragraph) => (
            <span key={paragraph}>{paragraph}</span>
          ))}
        </Typography>
        <form noValidate autoComplete="off" onSubmit={handleSubmit}>
          <FormControl fullWidth>
            <InputLabel className={classes.label}>
              {locale("비밀번호")}
            </InputLabel>
            <OutlinedInput
              id="password-input"
              onChange={handlePasswordChange}
              className={classes.textInput}
              type={showPassword ? "text" : "password"}
              endAdornment={
                <VisibilityAdornment
                  onClick={handleShowPassword}
                  show={showPassword}
                />
              }
            />
          </FormControl>
          <FormControl fullWidth>
            <InputLabel className={classes.label}>
              {locale("비밀번호 (확인)")}
            </InputLabel>
            <OutlinedInput
              id="password-confirm-input"
              error={password !== passwordConfirm}
              type={showPasswordConfirm ? "text" : "password"}
              onChange={handlePasswordConfirmChange}
              className={classes.textInput}
              endAdornment={
                <VisibilityAdornment
                  onClick={handleShowPasswordConfirm}
                  show={showPasswordConfirm}
                />
              }
            />
          </FormControl>
          <Button
            disabled={password === "" || password !== passwordConfirm}
            color="primary"
            type="submit"
            className={classes.submit}
            variant="contained"
          >
            {locale("마치기")}
          </Button>
        </form>
      </div>
    );
  }
);

export default inject("accountStore", "routerStore")(CreateAccountView);
