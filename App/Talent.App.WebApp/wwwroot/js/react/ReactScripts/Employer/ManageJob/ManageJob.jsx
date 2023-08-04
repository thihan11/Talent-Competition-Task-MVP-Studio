import React from 'react';
import ReactDOM from 'react-dom';
import Cookies from 'js-cookie';
import LoggedInBanner from '../../Layout/Banner/LoggedInBanner.jsx';
import { LoggedInNavigation } from '../../Layout/LoggedInNavigation.jsx';
import { JobSummaryCard } from './JobSummaryCard.jsx';
import { BodyWrapper, loaderData } from '../../Layout/BodyWrapper.jsx';
import { Pagination, Icon, Dropdown, Checkbox, Accordion, Form, Segment } from 'semantic-ui-react';

export default class ManageJob extends React.Component {
    constructor(props) {
        super(props);
        let loader = loaderData
        loader.allowedUsers.push("Employer");
        loader.allowedUsers.push("Recruiter");
        //console.log(loader)
        this.state = {
            loadJobs: [],
            loaderData: loader,
            activePage: 1,
            sortBy: {
                date: "desc"
            },
            filter: {
                showActive: true,
                showClosed: true,
                showDraft: true,
                showExpired: true,
                showUnexpired: true
            },
            totalPages: 1,
            activeIndex: "",
            limit: 6,
            isFilterChanged : false
        }
        this.loadData = this.loadData.bind(this);
        this.init = this.init.bind(this);
        //your functions go here

        this.handlePagination = this.handlePagination.bind(this);
        this.handleSortByDate = this.handleSortByDate.bind(this);
        this.handleFilterChange = this.handleFilterChange.bind(this);
    };

    init() {
        let loaderData = TalentUtil.deepCopy(this.state.loaderData)
        loaderData.isLoading = false;
        this.setState({ loaderData, isFilterChanged: false });//comment this

        //set loaderData.isLoading to false after getting data
        //this.loadData(() =>
         //  this.setState({ loaderData })
        //)
        
        //console.log(this.state.loaderData)
    }

    componentDidMount() {
        this.init();
        this.loadData();
    };

    loadData(_callback) {
        var link = 'http://localhost:51689/listing/listing/getSortedEmployerJobs?';
        var cookies = Cookies.get('talentAuthToken');
       // your ajax call and other logic goes here

        const { activePage, sortBy, limit } = this.state;
        const { showActive, showClosed, showDraft, showExpired, showUnexpired } = this.state.filter;
        const passvalues = `activePage=${activePage}&sortByDate=${sortBy.date}&showActive=${showActive}&showClosed=${showClosed}&showDraft=${showDraft}&showExpired=${showExpired}&showUnexpired=${showUnexpired}&limit=${limit}`;
        

        $.ajax({
            url: link + passvalues,
            headers: {
                'Authorization': 'Bearer ' + cookies,
                'Content-Type': 'application/json'
            },
            type: "GET",
            contentType: "application/json",
            dataType: "json",
            success: function (res) {
                if (res.success == true) {
                    const totalPages = Math.ceil(res.totalCount / limit);
                    this.setState({ loadJobs: res.myJobs, totalPages });
                } else {
                    TalentUtil.notification.show(res.message, "error", null, null);
                }
            }.bind(this)

        })
    }

    handlePagination(_e, { activePage }) {
        this.setState({ activePage }, () => this.loadData());
    }

    handleFilterChange(_e, { value }) {
        const filter = Object.assign({}, this.state.filter);
        filter[value] = !filter[value]; // Toggle the value (true to false or vice versa)

        // Check if any filter has changed
        const isFilterChanged = Object.values(filter).some(val => val !== this.state.filter[val]);
        console.log('Is filter changed:', isFilterChanged);

        // Update the state with the modified filter and the isFilterChanged flag
        this.setState({ filter, isFilterChanged }, () => {
            // Call loadData only if any filter has changed
            if (this.state.isFilterChanged) {

                console.log('Calling loadData...');
                this.loadData();
            }
        });
    }

    handleSortByDate(_e, { value }) {
        const sortBy = Object.assign({}, this.state.sortBy)
        sortBy.date = value;
        this.setState({ sortBy }, () => this.loadData());
    }

   /* loadNewData(data) {
        var loader = this.state.loaderData;
        loader.isLoading = true;
        data[loaderData] = loader;
        this.setState(data, () => {
            this.loadData(() => {
                loader.isLoading = false;
                this.setState({
                    loadData: loader
                })
            })
        });
    }*/

    render() {

        const jobsData = this.state.loadJobs.length === 0 ? <p>No Jobs Found</p> : this.state.loadJobs.map(job => <JobSummaryCard key={job.id} job={job} />)
        const { activePage, totalPages } = this.state;
        const dateChoices = [
            { key: 'desc', value: 'desc', text: 'Newest first' },
            { key: 'asc', value: 'asc', text: 'Oldest first' }
        ];

        const filterChoices = [
            { key: 'Active', value: 'showActive', text: 'Active' },
            { key: 'Closed', value: 'showClosed', text: 'Closed' },
            { key: 'Draft', value: 'showDraft', text: 'Draft' },
            { key: 'Expired', value: 'showExpired', text: 'Expired' },
            { key: 'Unexpired', value: 'showUnexpired', text: 'Unexpired' }

        ];

        return (
            <BodyWrapper reload={this.init} loaderData={this.state.loaderData}>
                <div className="ui container">
                    <div>
                        <h3>List of Jobs</h3>
                        <div>
                            <Icon name='filter' /> <span className="text">Filter:</span>
                            <Dropdown inline text="Choose filter" options={filterChoices} onChange={ (e,data) => this.handleFilterChange(e,data)} />
                            <Icon name='calendar alternate' /> <span>Sort by date:</span>
                            <Dropdown inline dafaultValue={dateChoices[0].value} options={dateChoices} onChange={this.handleSortByDate} />
                        </div>
                    </div>
                    <br />
                    <div className="ui three stackable cards">
                        {jobsData}
                    </div>
                    <Segment basic textAlign='center'>
                        <Pagination activePage={activePage} totalPages={totalPages} onPageChange={this.handlePagination} />
                    </Segment>
                </div>
            </BodyWrapper>
        )
    }
}