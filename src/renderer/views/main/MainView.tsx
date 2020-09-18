import React from "react";
import { observer, inject } from "mobx-react";
import LobbyView from "../lobby/LobbyView";
import LoginView from "../login/LoginView";
import { IStoreContainer } from "../../../interfaces/store";
import { useProtectedPrivateKeysQuery } from "../../../generated/graphql";
import { Button, Container, Box } from "@material-ui/core";
import { NineChroniclesLogo } from "../../components/NineChroniclesLogo";
import mainViewStyle from "./MainView.style";

import { useLocale } from "../../i18n";
import { Main } from "../../../interfaces/i18n";

const MainView = observer(
  ({ accountStore, routerStore, gameStore }: IStoreContainer) => {
    const classes = mainViewStyle();
    const { locale } = useLocale<Main>("main");

    const description = locale("description");
    if (typeof description === "string")
      throw Error("main.description is not array in src/i18n/index.json");

    return (
      <Container className={classes.root}>
        <NineChroniclesLogo />
        <h1 className={classes.title}>
          {locale("나인 크로니클에 오신 걸 환영합니다!")}
        </h1>
        <article className={classes.body}>
          {description.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </article>

        <Box className={classes.buttonContainer}>
          <Button
            onClick={() => routerStore.push("/account/create")}
            variant="contained"
            color="primary"
            className={classes.button}
          >
            {locale("계정 생성하기")}
          </Button>
        </Box>
      </Container>
    );
  }
);

export default inject("accountStore", "routerStore", "gameStore")(MainView);
