import React, { useState } from 'react';
import {
    Card,
    CardBody,
    CardTitle,
    Level,
    LevelItem,
    Select,
    SelectOption,
    SelectVariant,
    Spinner,
} from '@patternfly/react-core';
import { Chart, ChartBar, ChartGroup, ChartVoronoiContainer } from '@patternfly/react-charts';
import { TableErrorState } from '@app/Common/TableErrorState';
import { useTranslation } from 'react-i18next';
import { useDataDistribution } from '@app/services/dataDistributionHook';
import { DataDistributionStatsOption } from "@services/infinispanRefData";
import { PopoverHelp } from '@app/Common/PopoverHelp';

const DataDistribution = (props: {
    cacheName: string;
}) => {
    const { t } = useTranslation();
    const brandname = t('brandname.brandname');

    const [isOpenStatsOptions, setIsOpenStatsOptions] = useState<boolean>(false);
    const [statsOption, setStatsOption] = useState<string>(DataDistributionStatsOption.TotalEntries);

    const { dataDistribution, loading, error } = useDataDistribution(props.cacheName);

    const onSelectStatsOptions = (event, selection, isPlaceholder) => {
        if(selection === t('caches.cache-metrics.data-distribution-option-entries'))
            setStatsOption(DataDistributionStatsOption.TotalEntries);
        else if(selection === t('caches.cache-metrics.data-distribution-option-memory'))
            setStatsOption(DataDistributionStatsOption.MemoryEntries);
        setIsOpenStatsOptions(false);
    };

    const buildCardContent = () => {
        if (loading && dataDistribution === undefined) {
            return (
                <Spinner size={'lg'} />
            );
        }

        if (error != '') {
            return (
                <TableErrorState error={error} />
            )
        }

        // Find max domain
        let maxDomain = 1
        if(dataDistribution){
            if(statsOption === DataDistributionStatsOption.TotalEntries){
                maxDomain = dataDistribution.reduce((max, entry) => {
                    return Math.max(max, entry.total_entries);
                } , 1);
            }
            else{
                maxDomain = dataDistribution.reduce((max, entry) => {
                    return Math.max(max, entry.memory_entries);
                } , 1);
            }
        }

        const data = dataDistribution?.map((item) => {
            const yaxis = statsOption === DataDistributionStatsOption.TotalEntries ? item.total_entries : item.memory_entries;
            return { name: item.node_name, y: yaxis, x: item.node_name }
        }
        );

        return (
            <div style={{ height: '450px', width: '700px', margin: "auto" }}>
                <Chart
                    ariaDesc={t('caches.cache-metrics.data-distribution')}
                    ariaTitle={t('caches.cache-metrics.data-distribution')}
                    containerComponent={<ChartVoronoiContainer 
                                            labels={({ datum }) => datum.y !== 0 ? `${datum.y}` : `${t('caches.cache-metrics.data-distribution-no-entry')}`} 
                                            constrainToVisibleArea />}
                    domain={{ y: [0, maxDomain] }}
                    domainPadding={{ x: [30, 25] }}
                    legendData={[{ 
                        name: statsOption === DataDistributionStatsOption.TotalEntries ? 
                                        t('caches.cache-metrics.data-distribution-option-entries')
                                        : t('caches.cache-metrics.data-distribution-option-memory')}]}
                    legendOrientation="horizontal"
                    legendPosition="bottom"
                    height={350}
                    padding={{
                        bottom: 50,
                        left: 200, // Adjusted to accommodate y axis label
                        right: 100, // Adjusted to accommodate legend
                        top: 50
                    }}
                    width={700}
                >
                    <ChartGroup offset={11} horizontal>
                        <ChartBar data={data} />
                    </ChartGroup>
                </Chart>
            </div>
        );
    };

    const buildStatsOption = () => {
        return (
            <Select
                variant={SelectVariant.single}
                aria-label="storage-select"
                onToggle={() => setIsOpenStatsOptions(!isOpenStatsOptions)}
                onSelect={onSelectStatsOptions}
                selections={statsOption}
                isOpen={isOpenStatsOptions}
                aria-labelledby="toggle-id-storage"
                toggleId="storageSelector"
                width={200}
                position="right"
            >
                <SelectOption key={0} value={t('caches.cache-metrics.data-distribution-option-entries')} />
                <SelectOption key={1} value={t('caches.cache-metrics.data-distribution-option-memory')} />
            </Select>
        );
    }

    return (
        <Card>
            <CardTitle>
                <Level id={'data-node-stats'}>
                    <LevelItem>
                        <PopoverHelp
                            name='data-node-stats'
                            label={t('caches.cache-metrics.data-distribution-title')}
                            content={t('caches.cache-metrics.data-distribution-tooltip')}
                            text={t('caches.cache-metrics.data-distribution-title')}
                        />
                    </LevelItem>
                    {buildStatsOption()}
                </Level>
            </CardTitle>
            <CardBody>{buildCardContent()}</CardBody>
        </Card>
    );
};

export { DataDistribution };
