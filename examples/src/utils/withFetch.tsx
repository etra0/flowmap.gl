/*
 * Copyright 2018 Teralytics
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { csvParse } from 'd3-dsv';
import React from 'react';

export const Message = ({ children }: { children: string }) => <div style={{ padding: '1em' }}>{children}</div>;

const withFetch = (mode: 'csv' | 'json', propName: string, url: string) => (Comp: React.ComponentType<any>) => (
  props: any,
) => {
  class Fetcher extends React.Component {
    state = {
      error: null,
      data: null,
    };
    componentDidMount() {
      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error(response.statusText);
          }
          switch (mode) {
            case 'json':
              return response.json();
            case 'csv':
              return response.text();
          }
        })
        .catch(reason => {
          console.log(reason);
          this.setState({ error: true });
        })
        .then(data => this.setState({ data: mode === 'csv' ? csvParse(data) : data }));
    }
    render() {
      const { data, error } = this.state;
      if (error) {
        return <Message>Oops… Data fetching failed.</Message>;
      }
      if (!data) {
        return <Message>Fetching data…</Message>;
      }
      return <Comp {...{ ...props, [propName]: this.state.data }} />;
    }
  }
  return <Fetcher />;
};

export const withFetchCsv = (propName: string, url: string) => withFetch('csv', propName, url);
export const withFetchJson = (propName: string, url: string) => withFetch('json', propName, url);
