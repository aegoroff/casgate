// Copyright 2022 The Casdoor Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import moment from "moment";
import React from "react";
import {Button, Card, Col, DatePicker, Input, InputNumber, Row, Select, Switch} from "antd";
import * as OrganizationBackend from "./backend/OrganizationBackend";
import * as PlanBackend from "./backend/PlanBackend";
import * as SubscriptionBackend from "./backend/SubscriptionBackend";
import * as UserBackend from "./backend/UserBackend";
import * as Setting from "./Setting";
import i18next from "i18next";
import dayjs from "dayjs";

class SubscriptionEditPage extends React.Component {
  constructor(props) {
    super(props);
    console.log(props);
    console.log("orgName:");
    console.log(props.organizationName !== undefined ? props.organizationName : props.match.params.organizationName);
    this.state = {
      classes: props,
      organizationName: props.organizationName !== undefined ? props.organizationName : props.match.params.organizationName,
      // organizationName: props.account.organization.name,
      subscriptionName: props.match.params.subscriptionName,
      subscription: null,
      organizations: [],
      users: [],
      planes: [],
      providers: [],
      mode: props.location.mode !== undefined ? props.location.mode : "edit",
    };
  }

  UNSAFE_componentWillMount() {
    this.getSubscription();
    // this.getUsers();
    this.getOrganizations();
  }

  getSubscription() {
    SubscriptionBackend.getSubscription(this.state.organizationName, this.state.subscriptionName)
      .then((subscription) => {
        this.setState({
          subscription: subscription,
        });

        this.getUsers(subscription.owner);
        this.getPlanes(subscription.owner);
      });
  }

  getPlanes(organizationName) {
    PlanBackend.getPlans(organizationName)
      .then((res) => {
        this.setState({
          planes: res,
        });
      });
  }

  getUsers(organizationName) {
    console.log(organizationName);
    UserBackend.getUsers(organizationName)
      .then((res) => {
        this.setState({
          users: res,
        });
      });
  }

  getOrganizations() {
    OrganizationBackend.getOrganizations("admin")
      .then((res) => {
        this.setState({
          organizations: (res.msg === undefined) ? res : [],
        });
      });
  }

  parseSubscriptionField(key, value) {
    if ([""].includes(key)) {
      value = Setting.myParseInt(value);
    }
    return value;
  }

  updateSubscriptionField(key, value) {
    value = this.parseSubscriptionField(key, value);

    const subscription = this.state.subscription;
    subscription[key] = value;
    this.setState({
      subscription: subscription,
    });
  }

  renderSubscription() {
    return (
      <Card size="small" title={
        <div>
          {this.state.mode === "add" ? i18next.t("subscription:New Subscription") : i18next.t("subscription:Edit Subscription")}&nbsp;&nbsp;&nbsp;&nbsp;
          <Button onClick={() => this.submitSubscriptionEdit(false)}>{i18next.t("general:Save")}</Button>
          <Button style={{marginLeft: "20px"}} type="primary" onClick={() => this.submitSubscriptionEdit(true)}>{i18next.t("general:Save & Exit")}</Button>
          {this.state.mode === "add" ? <Button style={{marginLeft: "20px"}} onClick={() => this.deleteSubscription()}>{i18next.t("general:Cancel")}</Button> : null}
        </div>
      } style={(Setting.isMobile()) ? {margin: "5px"} : {}} type="inner">
        <Row style={{marginTop: "10px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Organization"), i18next.t("general:Organization - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Select virtual={false} style={{width: "100%"}} value={this.state.subscription.owner} onChange={(owner => {
              this.updateSubscriptionField("owner", owner);
              this.getUsers(owner);
              this.getPlanes(owner);
            })}
            options={this.state.organizations.map((organization) => Setting.getOption(organization.name, organization.name))
            } />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Name"), i18next.t("general:Name - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input value={this.state.subscription.name} onChange={e => {
              this.updateSubscriptionField("name", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Display name"), i18next.t("general:Display name - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input value={this.state.subscription.displayName} onChange={e => {
              this.updateSubscriptionField("displayName", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("subscription:Expire In Days"), i18next.t("subscription:Expire In Days - Tooltip"))}
          </Col>
          <Col span={22} >
            <InputNumber value={this.state.subscription.expireInDays} onChange={value => {
              this.updateSubscriptionField("expireInDays", value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("subscription:Start Date"), i18next.t("subscription:Start Date - Tooltip"))}
          </Col>
          <Col span={22} >
            <DatePicker value={dayjs(this.state.subscription.startDate)} onChange={value => {
              this.updateSubscriptionField("startDate", value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("subscription:End Date"), i18next.t("subscription:End Date - Tooltip"))}
          </Col>
          <Col span={22} >
            <DatePicker value={dayjs(this.state.subscription.endDate)} onChange={value => {
              this.updateSubscriptionField("endDate", value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("subscription:Sub users"), i18next.t("subscription:Sub users - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Select style={{width: "100%"}} value={this.state.subscription.user}
              onChange={(value => {this.updateSubscriptionField("user", value);})}
              options={this.state.users.map((user) => Setting.getOption(`${user.owner}/${user.name}`, `${user.owner}/${user.name}`))}
            />
          </Col>
        </Row>

        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("subscription:Sub plan"), i18next.t("subscription:Sub plan - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Select virtual={false} style={{width: "100%"}} value={this.state.subscription.plan} onChange={(value => {this.updateSubscriptionField("plan", value);})}
              options={this.state.planes.map((plan) => Setting.getOption(`${plan.owner}/${plan.name}`, `${plan.owner}/${plan.name}`))
              } />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("subscription:Detail"), i18next.t("subscription:Detail - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input value={this.state.subscription.detail} onChange={e => {
              this.updateSubscriptionField("detail", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Description"), i18next.t("general:Description - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input value={this.state.subscription.description} onChange={e => {
              this.updateSubscriptionField("description", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("subscription:Key"), i18next.t("subscription:Key - Tooltip"))} :
          </Col>
          <Col span={22} >
            <div>{Setting.getClickable(this.state.subscription.key)}</div>
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 19 : 2}>
            {Setting.getLabel(i18next.t("general:Is enabled"), i18next.t("general:Is enabled - Tooltip"))} :
          </Col>
          <Col span={1} >
            <Switch checked={this.state.subscription.isEnabled} onChange={checked => {
              this.updateSubscriptionField("isEnabled", checked);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Submitter"), i18next.t("general:Submitter - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input disabled={true} value={this.state.subscription.submitter} onChange={e => {
              this.updateSubscriptionField("submitter", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Approver"), i18next.t("general:Approver - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input disabled={true} value={this.state.subscription.approver} onChange={e => {
              this.updateSubscriptionField("approver", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Approve time"), i18next.t("general:Approve time - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input disabled={true} value={Setting.getFormattedDate(this.state.subscription.approveTime)} onChange={e => {
              this.updatePermissionField("approveTime", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:State"), i18next.t("general:State - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Select virtual={false} disabled={!Setting.isLocalAdminUser(this.props.account)} style={{width: "100%"}} value={this.state.subscription.state} onChange={(value => {
              if (this.state.subscription.state !== value) {
                if (value === "Approved") {
                  this.updateSubscriptionField("approver", this.props.account.name);
                  this.updateSubscriptionField("approveTime", moment().format());
                } else {
                  this.updateSubscriptionField("approver", "");
                  this.updateSubscriptionField("approveTime", "");
                }
              }

              this.updateSubscriptionField("state", value);
            })}
            options={[
              {value: "Approved", name: i18next.t("subscription:Approved")},
              {value: "Pending", name: i18next.t("subscription:Pending")},
            ].map((item) => Setting.getOption(item.name, item.value))}
            />
          </Col>
        </Row>
      </Card>
    );
  }

  submitSubscriptionEdit(willExist) {
    const subscription = Setting.deepCopy(this.state.subscription);
    SubscriptionBackend.updateSubscription(this.state.organizationName, this.state.subscriptionName, subscription)
      .then((res) => {
        if (res.status === "ok") {
          Setting.showMessage("success", i18next.t("general:Successfully saved"));
          this.setState({
            subscriptionName: this.state.subscription.name,
          });

          if (willExist) {
            this.props.history.push("/subscriptions");
          } else {
            this.props.history.push(`/subscriptions/${this.state.subscription.name}`);
          }
        } else {
          Setting.showMessage("error", `${i18next.t("general:Failed to save")}: ${res.msg}`);
          this.updateSubscriptionField("name", this.state.subscriptionName);
        }
      })
      .catch(error => {
        Setting.showMessage("error", `${i18next.t("general:Failed to connect to server")}: ${error}`);
      });
  }

  deleteSubscription() {
    SubscriptionBackend.deleteSubscription(this.state.subscription)
      .then((res) => {
        if (res.status === "ok") {
          this.props.history.push("/subscriptions");
        } else {
          Setting.showMessage("error", `${i18next.t("general:Failed to delete")}: ${res.msg}`);
        }
      })
      .catch(error => {
        Setting.showMessage("error", `${i18next.t("general:Failed to connect to server")}: ${error}`);
      });
  }

  render() {
    return (
      <div>
        {
          this.state.subscription !== null ? this.renderSubscription() : null
        }
        <div style={{marginTop: "20px", marginLeft: "40px"}}>
          <Button size="large" onClick={() => this.submitSubscriptionEdit(false)}>{i18next.t("general:Save")}</Button>
          <Button style={{marginLeft: "20px"}} type="primary" size="large" onClick={() => this.submitSubscriptionEdit(true)}>{i18next.t("general:Save & Exit")}</Button>
          {this.state.mode === "add" ? <Button style={{marginLeft: "20px"}} size="large" onClick={() => this.deleteSubscription()}>{i18next.t("general:Cancel")}</Button> : null}
        </div>
      </div>
    );
  }
}

export default SubscriptionEditPage;
