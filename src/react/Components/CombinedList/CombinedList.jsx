import React from "react";
import { translate } from "react-i18next";
import { connect } from "react-redux";
import Grid from "@material-ui/core/Grid";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";
import LinearProgress from "@material-ui/core/LinearProgress";
import List from "@material-ui/core/List";
import ListSubheader from "@material-ui/core/ListSubheader";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";

import KeyboardArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import SkipNextIcon from "@material-ui/icons/SkipNext";
import SkipPreviousIcon from "@material-ui/icons/SkipPrevious";
import InfoIcon from "@material-ui/icons/Info";

import BunqMeTabListItem from "../ListItems/BunqMeTabListItem";
import PaymentListItem from "../ListItems/PaymentListItem";
import MasterCardActionListItem from "../ListItems/MasterCardActionListItem";
import RequestResponseListItem from "../ListItems/RequestResponseListItem";
import RequestInquiryListItem from "../ListItems/RequestInquiryListItem";
import ShareInviteBankInquiryListItem from "../ListItems/ShareInviteBankInquiryListItem";
import ShareInviteBankResponseListItem from "../ListItems/ShareInviteBankResponseListItem";
import ClearBtn from "../FilterComponents/ClearFilter";
import FilterDrawer from "../FilterComponents/FilterDrawer";
import EventData from "./EventData";

import { openSnackbar } from "../../Actions/snackbar";
import { bunqMeTabPut } from "../../Actions/bunq_me_tab";
import {
    nextPage,
    previousPage,
    setPage,
    setPageSize,
    firstPage
} from "../../Actions/pagination";

import { humanReadableDate } from "../../Helpers/Utils";
import {
    paymentFilter,
    bunqMeTabsFilter,
    masterCardActionFilter,
    requestInquiryFilter,
    requestResponseFilter,
    shareInviteBankInquiryFilter,
    shareInviteBankResponseFilter
} from "../../Helpers/DataFilters";
import FilterDisabledChecker from "../../Helpers/FilterDisabledChecker";

const styles = {
    button: {
        width: "100%"
    },
    pageField: {
        width: 60
    },
    list: {
        textAlign: "left"
    },
    leftPaginationDiv: {
        marginRight: 4
    },
    centerPaginationDiv: {
        textAlign: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    },
    rightPaginationDiv: {
        marginLeft: 4
    }
};

class CombinedList extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            displayEventData: false
        };
    }

    shouldComponentUpdate(nextProps) {
        const isCurrentlyLoading =
            this.props.bunqMeTabsLoading ||
            this.props.paymentsLoading ||
            this.props.requestResponsesLoading ||
            this.props.requestInquiriesLoading ||
            this.props.masterCardActionsLoading;
        const willBeLoading =
            nextProps.bunqMeTabsLoading ||
            nextProps.paymentsLoading ||
            nextProps.requestResponsesLoading ||
            nextProps.requestInquiriesLoading ||
            nextProps.masterCardActionsLoading;

        // don't update the components if we are loading now and will be loading in the next update
        if (isCurrentlyLoading && willBeLoading) return false;

        return true;
    }

    copiedValue = type => callback => {
        this.props.openSnackbar(`Copied ${type} to your clipboard`);
    };

    toggleEventData = event =>
        this.setState({ displayEventData: !this.state.displayEventData });

    getCommonFilters = () => {
        return {
            dateFromFilter: this.props.dateFromFilter,
            dateToFilter: this.props.dateToFilter,
            searchTerm: this.props.searchTerm,

            categories: this.props.categories,
            categoryConnections: this.props.categoryConnections,
            selectedCategories: this.props.selectedCategories,
            toggleCategoryFilter: this.props.toggleCategoryFilter,

            selectedAccountIds: this.props.selectedAccountIds,
            toggleAccountIds: this.props.toggleAccountIds,

            amountFilterAmount: this.props.amountFilterAmount,
            amountFilterType: this.props.amountFilterType
        };
    };

    paymentMapper = () => {
        if (this.props.hiddenTypes.includes("Payment")) return [];

        return this.props.payments
            .filter(
                paymentFilter({
                    paymentVisibility: this.props.paymentVisibility,
                    paymentType: this.props.paymentType,
                    ...this.getCommonFilters()
                })
            )
            .map(payment => {
                return {
                    component: (
                        <PaymentListItem
                            payment={payment}
                            BunqJSClient={this.props.BunqJSClient}
                        />
                    ),
                    filterDate: payment.created,
                    info: payment
                };
            });
    };

    bunqMeTabsMapper = () => {
        if (this.props.hiddenTypes.includes("BunqMeTab")) return [];

        return this.props.bunqMeTabs
            .filter(
                bunqMeTabsFilter({
                    bunqMeTabVisibility: this.props.bunqMeTabVisibility,
                    bunqMeTabType: this.props.bunqMeTabType,
                    ...this.getCommonFilters()
                })
            )
            .map(bunqMeTab => {
                return {
                    component: (
                        <BunqMeTabListItem
                            bunqMeTab={bunqMeTab}
                            BunqJSClient={this.props.BunqJSClient}
                            copiedValue={this.copiedValue}
                            bunqMeTabLoading={this.props.bunqMeTabLoading}
                            bunqMeTabsLoading={this.props.bunqMeTabsLoading}
                            bunqMeTabPut={this.props.bunqMeTabPut}
                            user={this.props.user}
                        />
                    ),
                    filterDate: bunqMeTab.created,
                    info: bunqMeTab
                };
            });
    };

    masterCardActionMapper = () => {
        if (this.props.hiddenTypes.includes("MasterCardAction")) return [];

        return this.props.masterCardActions
            .filter(
                masterCardActionFilter({
                    paymentVisibility: this.props.paymentVisibility,
                    paymentType: this.props.paymentType,
                    ...this.getCommonFilters()
                })
            )
            .map(masterCardAction => {
                return {
                    component: (
                        <MasterCardActionListItem
                            masterCardAction={masterCardAction}
                            BunqJSClient={this.props.BunqJSClient}
                        />
                    ),
                    filterDate: masterCardAction.created,
                    info: masterCardAction
                };
            });
    };

    requestResponseMapper = (onlyPending = false, onlyNonPending = false) => {
        if (this.props.hiddenTypes.includes("RequestResponse")) return [];

        return this.props.requestResponses
            .filter(requestResponse => {
                if (onlyPending === true) {
                    return requestResponse.RequestResponse.status === "PENDING";
                }

                if (onlyNonPending === true) {
                    return requestResponse.RequestResponse.status !== "PENDING";
                }

                return true;
            })
            .filter(
                requestResponseFilter({
                    requestVisibility: this.props.requestVisibility,
                    requestType: this.props.requestType,
                    ...this.getCommonFilters()
                })
            )
            .map(requestResponse => {
                return {
                    component: (
                        <RequestResponseListItem
                            requestResponse={requestResponse}
                            BunqJSClient={this.props.BunqJSClient}
                        />
                    ),
                    filterDate: requestResponse.created,
                    info: requestResponse
                };
            });
    };

    requestInquiryMapper = () => {
        if (this.props.hiddenTypes.includes("RequestInquiry")) return [];

        return this.props.requestInquiries
            .filter(
                requestInquiryFilter({
                    requestVisibility: this.props.requestVisibility,
                    requestType: this.props.requestType,
                    ...this.getCommonFilters()
                })
            )
            .map(requestInquiry => {
                return {
                    component: (
                        <RequestInquiryListItem
                            requestInquiry={requestInquiry}
                            BunqJSClient={this.props.BunqJSClient}
                        />
                    ),
                    filterDate: requestInquiry.created,
                    info: requestInquiry
                };
            });
    };

    shareInviteBankInquiryMapper = () => {
        if (this.props.hiddenTypes.includes("ShareInviteBankInquiry"))
            return [];

        return this.props.shareInviteBankInquiries
            .filter(
                shareInviteBankInquiryFilter({
                    bunqMeTabType: this.props.bunqMeTabType,
                    paymentType: this.props.paymentType,
                    requestType: this.props.requestType,
                    ...this.getCommonFilters()
                })
            )
            .map(shareInviteBankInquiry => {
                const shareInviteBankInquiryInfo = shareInviteBankInquiry.ShareInviteBankInquiry
                    ? shareInviteBankInquiry.ShareInviteBankInquiry
                    : shareInviteBankInquiry.ShareInviteBankResponse;

                return {
                    component: (
                        <ShareInviteBankInquiryListItem
                            BunqJSClient={this.props.BunqJSClient}
                            shareInviteBankInquiry={shareInviteBankInquiryInfo}
                            openSnackbar={this.props.openSnackbar}
                            user={this.props.user}
                        />
                    ),
                    filterDate: shareInviteBankInquiryInfo.created,
                    info: shareInviteBankInquiry
                };
            });
    };

    shareInviteBankResponseMapper = () => {
        if (this.props.hiddenTypes.includes("ShareInviteBankResponse"))
            return [];

        return this.props.shareInviteBankResponses
            .filter(
                shareInviteBankResponseFilter({
                    bunqMeTabType: this.props.bunqMeTabType,
                    paymentType: this.props.paymentType,
                    requestType: this.props.requestType,
                    ...this.getCommonFilters()
                })
            )
            .map(shareInviteBankResponse => {
                return (
                    <ShareInviteBankResponseListItem
                        BunqJSClient={this.props.BunqJSClient}
                        shareInviteBankResponse={
                            shareInviteBankResponse.ShareInviteBankResponse
                        }
                        openSnackbar={this.props.openSnackbar}
                        user={this.props.user}
                    />
                );
            });
    };

    lastPage = page => () => {
        this.props.setPage(page);
    };
    setPage = pageCount => event => {
        let page = event.target.value - 1;
        pageCount = pageCount - 1;

        if (page < 0) page = 0;
        if (page > pageCount) page = pageCount;

        this.props.setPage(page);
    };
    setPageSize = event => {
        this.props.setPage(0);
        this.props.setPageSize(event.target.value);
    };

    render() {
        const {
            page,
            pageSize,
            t,
            selectedAccountIds,
            selectedCategories,
            searchTerm,
            paymentType,
            bunqMeTabType,
            requestType,
            paymentVisibility,
            bunqMeTabVisibility,
            requestVisibility
        } = this.props;

        let loadingContent =
            this.props.bunqMeTabsLoading ||
            this.props.paymentsLoading ||
            this.props.requestResponsesLoading ||
            this.props.requestInquiriesLoading ||
            this.props.shareInviteBankInquiriesLoading ||
            this.props.masterCardActionsLoading ? (
                <LinearProgress />
            ) : (
                <Divider />
            );

        const filterIsEnabled = FilterDisabledChecker({
            selectedAccountIds,
            selectedCategories,
            searchTerm,
            paymentType,
            bunqMeTabType,
            requestType,
            paymentVisibility,
            bunqMeTabVisibility,
            requestVisibility
        });
        // const filterEnabledText = t("Filtered items");

        // create arrays of the different endpoint types
        const bunqMeTabs = this.bunqMeTabsMapper();
        const payments = this.paymentMapper();
        const masterCardActions = this.masterCardActionMapper();
        const requestResponses = this.requestResponseMapper(false, true);
        const requestResponsesPending = this.requestResponseMapper(true);
        const requestInquiries = this.requestInquiryMapper();
        const shareInviteBankInquiries = this.shareInviteBankInquiryMapper();
        const shareInviteBankResponses = this.shareInviteBankResponseMapper();

        let groupedItems = {};

        // directly create a list for the pending requests
        const pendingRequestResponseComponents = requestResponsesPending.map(
            requestResponsesPendingItem => requestResponsesPendingItem.component
        );

        // combine the list, order by date and group by day
        const events = [
            ...bunqMeTabs,
            ...requestResponses,
            ...masterCardActions,
            ...requestInquiries,
            ...shareInviteBankInquiries,
            ...payments
        ].sort(function(a, b) {
            return new Date(b.filterDate) - new Date(a.filterDate);
        });

        // check if all pages is set (pageSize = 0)
        const usedPageSize = pageSize === 0 ? events.length : pageSize;

        // calculate last page
        const unRoundedPageCount = events.length / usedPageSize;
        const pageCount = unRoundedPageCount
            ? Math.ceil(unRoundedPageCount)
            : 1;

        // create a smaller list based on the page and pageSize
        const slicedEvents = events.slice(
            page * usedPageSize,
            (page + 1) * usedPageSize
        );

        // group by date
        slicedEvents.map(item => {
            const dateFull = new Date(item.filterDate);
            const date = new Date(
                dateFull.getFullYear(),
                dateFull.getMonth(),
                dateFull.getDate(),
                0,
                0,
                0
            );
            if (!groupedItems[date.getTime()]) {
                groupedItems[date.getTime()] = {
                    date: dateFull,
                    components: []
                };
            }

            // add item to this date group
            groupedItems[date.getTime()].components.push(item.component);
        });

        // turn the array of arrays back into a single list
        const combinedComponentList = [];
        Object.keys(groupedItems).map(dateLabel => {
            const groupedItem = groupedItems[dateLabel];

            // get the human readable text for this date group
            const groupTitleText = humanReadableDate(
                parseFloat(dateLabel),
                false
            );

            // add a header component for this date
            combinedComponentList.push([
                <ListSubheader>{groupTitleText}</ListSubheader>,
                <Divider />
            ]);

            // add the components to the list
            return groupedItem.components.map(component =>
                combinedComponentList.push(component)
            );
        });

        // add the connect requests and pending request responses to the top
        combinedComponentList.unshift(...shareInviteBankResponses);
        combinedComponentList.unshift(...pendingRequestResponseComponents);

        return (
            <List style={styles.left}>
                <ListSubheader>
                    {t("Payments and requests")}: {events.length}
                    <ListItemSecondaryAction>
                        <ClearBtn />
                        <IconButton onClick={this.toggleEventData}>
                            <InfoIcon />
                        </IconButton>
                        <FilterDrawer />
                    </ListItemSecondaryAction>
                </ListSubheader>

                <ListSubheader>
                    <Grid container>
                        <Grid item xs={1}>
                            <IconButton
                                style={styles.button}
                                onClick={this.props.firstPage}
                                disabled={page === 0}
                            >
                                <SkipPreviousIcon />
                            </IconButton>
                        </Grid>

                        <Grid item xs={1}>
                            <IconButton
                                style={styles.button}
                                onClick={this.props.previousPage}
                                disabled={page === 0}
                            >
                                <KeyboardArrowLeftIcon />
                            </IconButton>
                        </Grid>

                        <Grid item xs={4} style={styles.centerPaginationDiv}>
                            <TextField
                                style={styles.pageField}
                                value={page + 1}
                                type={"number"}
                                inputProps={{
                                    min: 1,
                                    max: pageCount,
                                    step: 1
                                }}
                                onChange={this.setPage(pageCount)}
                            />
                        </Grid>

                        <Grid item xs={4} style={styles.centerPaginationDiv}>
                            <TextField
                                select
                                style={styles.pageField}
                                value={pageSize}
                                onChange={this.setPageSize}
                            >
                                <MenuItem value={5}>5</MenuItem>
                                <MenuItem value={10}>10</MenuItem>
                                <MenuItem value={20}>20</MenuItem>
                                <MenuItem value={30}>30</MenuItem>
                                <MenuItem value={50}>50</MenuItem>
                                <MenuItem value={100}>100</MenuItem>
                                <MenuItem value={0}>All</MenuItem>
                            </TextField>
                        </Grid>

                        <Grid item xs={1}>
                            <IconButton
                                style={styles.button}
                                onClick={this.props.nextPage}
                                disabled={page + 1 >= pageCount}
                            >
                                <KeyboardArrowRightIcon />
                            </IconButton>
                        </Grid>

                        <Grid item xs={1}>
                            <IconButton
                                style={styles.button}
                                onClick={this.lastPage(pageCount - 1)}
                                disabled={page + 1 >= pageCount}
                            >
                                <SkipNextIcon />
                            </IconButton>
                        </Grid>
                    </Grid>
                </ListSubheader>

                <EventData
                    t={t}
                    events={events}
                    open={this.state.displayEventData}
                />

                {loadingContent}
                {combinedComponentList}
            </List>
        );
    }
}

const mapStateToProps = state => {
    return {
        user: state.user.user,
        accountsAccountId: state.accounts.selectedAccount,

        page: state.pagination.page,
        pageSize: state.pagination.page_size,

        searchTerm: state.search_filter.search_term,
        paymentType: state.payment_filter.type,
        paymentVisibility: state.payment_filter.visible,
        bunqMeTabType: state.bunq_me_tab_filter.type,
        bunqMeTabVisibility: state.bunq_me_tab_filter.visible,
        requestType: state.request_filter.type,
        requestVisibility: state.request_filter.visible,
        dateFromFilter: state.date_filter.from_date,
        dateToFilter: state.date_filter.to_date,

        amountFilterAmount: state.amount_filter.amount,
        amountFilterType: state.amount_filter.type,

        selectedCategories: state.category_filter.selected_categories,
        toggleCategoryFilter: state.category_filter.toggle,

        selectedAccountIds: state.account_id_filter.selected_account_ids,
        toggleAccountIds: state.account_id_filter.toggle,

        categories: state.categories.categories,
        categoryConnections: state.categories.category_connections,

        bunqMeTabs: state.bunq_me_tabs.bunq_me_tabs,
        bunqMeTabsLoading: state.bunq_me_tabs.loading,
        bunqMeTabLoading: state.bunq_me_tab.loading,

        masterCardActions: state.master_card_actions.master_card_actions,
        masterCardActionsLoading: state.master_card_actions.loading,

        requestInquiries: state.request_inquiries.request_inquiries,
        requestInquiriesLoading: state.request_inquiries.loading,

        requestResponses: state.request_responses.request_responses,
        requestResponsesLoading: state.request_responses.loading,

        payments: state.payments.payments,
        paymentsLoading: state.payments.loading,

        shareInviteBankInquiries:
            state.share_invite_bank_inquiries.share_invite_bank_inquiries,
        shareInviteBankInquiriesLoading:
            state.share_invite_bank_inquiries.loading,

        shareInviteBankResponses:
            state.share_invite_bank_responses.share_invite_bank_responses,
        shareInviteBankResponsesLoading:
            state.share_invite_bank_responses.loading
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    const { BunqJSClient } = ownProps;
    return {
        openSnackbar: message => dispatch(openSnackbar(message)),
        bunqMeTabPut: (userId, accountId, tabId, status) =>
            dispatch(
                bunqMeTabPut(BunqJSClient, userId, accountId, tabId, status)
            ),
        firstPage: () => dispatch(firstPage()),
        nextPage: () => dispatch(nextPage()),
        previousPage: () => dispatch(previousPage()),
        setPageSize: size => dispatch(setPageSize(size)),
        setPage: page => dispatch(setPage(page))
    };
};

CombinedList.defaultProps = {
    hiddenTypes: []
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(translate("translations")(CombinedList));
