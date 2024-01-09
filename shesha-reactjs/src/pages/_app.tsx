import CustomNProgress from '@/app-components/global/customNProgress';
import React from 'react';
import { AppProps } from 'next/app';
import { CustomErrorBoundary } from '@/components/index';
import { GlobalStateProvider, ShaApplicationProvider, StoredFilesProvider } from '@/providers';
import { PageWithLayout } from '@/interfaces/index';
import { useRouter } from 'next/router';
require('@/styles/index.less');

const BASE_URL = "http://localhost:21021";

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
	const router = useRouter();

	// Use the layout defined at the page level, if available
	const getLayout = (Component as PageWithLayout<any>).getLayout ?? ((page) => page);

	return (
		<CustomErrorBoundary>
			<GlobalStateProvider>
				<ShaApplicationProvider
					backendUrl={BASE_URL}
					router={router as any}
					noAuth={router?.asPath?.includes('/no-auth')}
				>
					<CustomNProgress />
					{/* <CustomNProgress /> */}
					<StoredFilesProvider baseUrl={BASE_URL} ownerId={''} ownerType={''}>
						{getLayout(<Component {...(router?.query || {})} {...pageProps} />)}
					</StoredFilesProvider>
				</ShaApplicationProvider>
			</GlobalStateProvider>
		</CustomErrorBoundary>
	);
}

export default MyApp;
