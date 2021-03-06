import React from "react";
import { translate } from "react-i18next";
import { connect } from "react-redux";
import Helmet from "react-helmet";
import StickyBox from "react-sticky-box";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Hidden from "@material-ui/core/Hidden";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";
import Tooltip from "@material-ui/core/Tooltip";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";

import MoneyIcon from "@material-ui/icons/AttachMoney";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import KeyIcon from "@material-ui/icons/VpnKey";

import TranslateButton from "../../Components/TranslationHelpers/Button";
import CombinedList from "../../Components/CombinedList/CombinedList";
import AccountList from "../../Components/AccountList/AccountList";
import NavLink from "../../Components/Routing/NavLink";
import AttachmentImage from "../../Components/AttachmentImage/AttachmentImage";
import SavingsGoalsList from "../../Components/SavingsGoals/SavingsGoalsList";

import { userLogin, userLogout } from "../../Actions/user";
import { requestInquirySend } from "../../Actions/request_inquiry";
import { registrationLogOut } from "../../Actions/registration";

const styles = {
    btn: {
        width: "100%"
    },
    savingsGoalsButton: {
        width: "100%",
        marginTop: 16
    },
    bigAvatar: {
        width: 50,
        height: 50
    },
    iconButton: {
        marginLeft: 16
    },
    tabItems: {
        minWidth: "20px"
    },
    title: {
        marginBottom: 0,
        marginLeft: 12
    },
    savingsGoalsPaper: {
        padding: 12
    },
    titleWrapper: {
        display: "flex",
        alignItems: "center"
    },
    headerButtonWrapper: {
        textAlign: "right"
    }
};

class Dashboard extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            selectedTab: "accounts"
        };
    }

    componentDidUpdate() {
        if (
            this.props.userType !== false &&
            this.props.userLoading === false &&
            this.props.usersLoading === false &&
            this.props.user === false
        ) {
            this.props.userLogin(this.props.userType, false);
        }
    }

    addMoney = event => {
        if (!this.props.requestInquiryLoading) {
            const requestInquiry = {
                amount_inquired: {
                    value: "500",
                    currency: "EUR"
                },
                counterparty_alias: {
                    type: "EMAIL",
                    value: "sugardaddy@bunq.com"
                },
                description: "Please daddy??",
                allow_bunqme: true
            };
            this.props.requestInquirySend(this.props.user.id, this.props.selectedAccount, [requestInquiry]);
        }
    };

    handleChange = (event, value) => {
        this.setState({ selectedTab: value });
    };

    render() {
        const { t, user, userType, savingsGoals } = this.props;
        const selectedTab = this.state.selectedTab;
        const userTypes = Object.keys(this.props.users);

        const displayName = this.props.user.display_name ? this.props.user.display_name : t("user");

        const profileAvatar = user ? (
            <Avatar style={styles.bigAvatar}>
                <AttachmentImage
                    height={50}
                    BunqJSClient={this.props.BunqJSClient}
                    imageUUID={user.avatar.image[0].attachment_public_uuid}
                />
            </Avatar>
        ) : null;

        const displaySavingsGoals = Object.keys(savingsGoals).some(savingsGoalId => {
            const savingsGoal = savingsGoals[savingsGoalId];
            return !savingsGoal.isEnded && savingsGoal.isStarted;
        });
        let isBunqPromoUser = false;
        if (user && user.customer_limit && user.customer_limit.limit_amount_monthly) {
            isBunqPromoUser = true;
        }
        const tabsEnabled = displaySavingsGoals;

        let tabsComponent = null;
        if (tabsEnabled) {
            tabsComponent = (
                <AppBar position="static" color="default">
                    <Tabs
                        value={this.state.selectedTab}
                        onChange={this.handleChange}
                        color="primary"
                        indicatorColor="primary"
                        textColor="primary"
                        fullWidth
                    >
                        <Tab style={styles.tabItems} value="accounts" label={t("Accounts")} />
                        {displaySavingsGoals && (
                            <Tab style={styles.tabItems} value="savingsGoals" label={t("Savings goals")} />
                        )}
                    </Tabs>
                </AppBar>
            );
        }

        let userTypeLabel = "";
        const OAuthLabel = t("OAuth");
        const businessLabel = t("Business");
        const personalLabel = t("Personal");
        const bunqPromoLabel = t("bunq promo");
        switch (userType) {
            case "UserCompany":
                userTypeLabel = `${businessLabel} ${t("account")}`;
                break;
            case "UserApiKey":
                userTypeLabel = `${OAuthLabel} ${t("account")}`;
                break;
            default:
            case "UserPerson":
                if (isBunqPromoUser) {
                    userTypeLabel = `${bunqPromoLabel} ${t("account")}`;
                } else {
                    userTypeLabel = `${personalLabel} ${t("account")}`;
                }
                break;
        }

        return (
            <Grid container spacing={16}>
                <Helmet>
                    <title>{`bunqDesktop - ${t("Dashboard")}`}</title>
                </Helmet>

                <Hidden mdDown>
                    <Grid item lg={1} xl={2} />
                </Hidden>

                <Grid item xs={12} md={12} lg={10} xl={8}>
                    <Grid container spacing={16}>
                        <Grid item xs={6} style={styles.titleWrapper}>
                            {this.props.limitedPermissions ? (
                                profileAvatar
                            ) : (
                                <NavLink to={"/profile"}>{profileAvatar}</NavLink>
                            )}

                            <div>
                                <Typography variant="h5" gutterBottom style={styles.title}>
                                    {displayName}
                                </Typography>
                                <Typography variant="body1" gutterBottom style={styles.title}>
                                    {userTypeLabel}
                                </Typography>
                            </div>
                        </Grid>

                        <Grid item xs={6} style={styles.headerButtonWrapper}>
                            {userTypes.length > 1 ? (
                                <Button style={styles.btn} onClick={this.props.logoutUser}>
                                    {t("Switch user")}
                                </Button>
                            ) : null}

                            <Tooltip id="tooltip-fab" title="Switch API keys">
                                <IconButton style={styles.iconButton} onClick={this.props.registrationLogOut}>
                                    <KeyIcon />
                                </IconButton>
                            </Tooltip>

                            <Tooltip id="tooltip-fab" title="Logout of account">
                                <IconButton
                                    style={styles.iconButton}
                                    onClick={() => {
                                        if (this.props.useNoPassword) {
                                            // if no password is set
                                            this.props.registrationLogOut();
                                        }
                                        location.reload();
                                    }}
                                >
                                    <ExitToAppIcon />
                                </IconButton>
                            </Tooltip>
                        </Grid>

                        <Grid item xs={12} sm={5} md={4}>
                            <StickyBox className={"sticky-container"}>
                                {tabsComponent}

                                {(selectedTab === "accounts" || tabsEnabled === false) && (
                                    <Paper>
                                        <AccountList
                                            BunqJSClient={this.props.BunqJSClient}
                                            initialBunqConnect={this.props.initialBunqConnect}
                                        />

                                        {this.props.environment === "SANDBOX" ? (
                                            !this.props.limitedPermissions ? (
                                                <div
                                                    style={{
                                                        textAlign: "center",
                                                        padding: 16
                                                    }}
                                                >
                                                    <Button
                                                        variant="outlined"
                                                        onClick={this.addMoney}
                                                        disabled={this.props.requestInquiryLoading}
                                                    >
                                                        <MoneyIcon />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Typography variant="body1" style={{ margin: 8 }}>
                                                    Logged in as OAuth sandbox user. Requesting money isn't possible.
                                                </Typography>
                                            )
                                        ) : null}
                                    </Paper>
                                )}

                                {selectedTab === "savingsGoals" &&
                                    displaySavingsGoals && (
                                        <Paper style={styles.savingsGoalsPaper}>
                                            <SavingsGoalsList hiddenTypes={["ended", "expired"]} type="small" />

                                            <TranslateButton
                                                component={NavLink}
                                                to="/savings-goal-page/null"
                                                variant="outlined"
                                                color="primary"
                                                style={styles.savingsGoalsButton}
                                            >
                                                New savings goal
                                            </TranslateButton>

                                            <TranslateButton
                                                component={NavLink}
                                                to="/savings-goals"
                                                variant="outlined"
                                                style={styles.savingsGoalsButton}
                                            >
                                                More details
                                            </TranslateButton>
                                        </Paper>
                                    )}
                            </StickyBox>
                        </Grid>

                        <Grid item xs={12} sm={7} md={8}>
                            <Paper>
                                <CombinedList
                                    BunqJSClient={this.props.BunqJSClient}
                                    initialBunqConnect={this.props.initialBunqConnect}
                                    displayRequestPayments={false}
                                    displayAcceptedRequests={true}
                                />
                            </Paper>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        );
    }
}

const mapStateToProps = state => {
    return {
        user: state.user.user,
        users: state.users.users,
        userType: state.user.user_type,
        userLoading: state.user.loading,
        limitedPermissions: state.user.limited_permissions,
        usersLoading: state.users.loading,

        requestInquiryLoading: state.request_inquiry.loading,
        selectedAccount: state.accounts.selected_account,

        savingsGoals: state.savings_goals.savings_goals,

        useNoPassword: state.registration.use_no_password,
        storedApiKeys: state.registration.stored_api_keys,
        environment: state.registration.environment
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    const { BunqJSClient } = ownProps;
    return {
        // only resets user type
        logoutUser: () => dispatch(userLogout()),

        // hard-logout
        registrationLogOut: () => dispatch(registrationLogOut(BunqJSClient)),

        // send a request, used for sandbox button
        requestInquirySend: (userId, accountId, requestInquiries) =>
            dispatch(requestInquirySend(BunqJSClient, userId, accountId, requestInquiries)),
        userLogin: (type, updated = false) => dispatch(userLogin(BunqJSClient, type, updated))
    };
};
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(translate("translations")(Dashboard));
